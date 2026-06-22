import { supabase } from "./supabase";
import type { AccessContext, Person, UserProfile, UserScope } from "./types";

export async function getAccessContext(): Promise<AccessContext> {
  if (!supabase) return emptyAccess();

  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user) return emptyAccess();

  const { data: profileData } = await supabase
    .from("user_profiles")
    .select("*, people(id, name, phone)")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  const profile = profileData as UserProfile | null;

  // Bootstrap: before the first permission profile exists, the logged user can manage the system.
  if (!profile) {
    return {
      profile: null,
      scopes: [],
      person: null,
      isAdminLike: true,
      isLeader: false,
      isMember: false
    };
  }

  const [{ data: scopesData }, { data: personData }] = await Promise.all([
    supabase.from("user_scopes").select("*").eq("user_profile_id", profile.id),
    profile.person_id ? supabase.from("people").select("*").eq("id", profile.person_id).maybeSingle() : Promise.resolve({ data: null })
  ]);

  const scopes = (scopesData ?? []) as UserScope[];
  const person = personData as Person | null;
  const isAdminLike = profile.role === "admin" || profile.role === "pastor" || profile.is_global_leader;

  return {
    profile,
    scopes,
    person,
    isAdminLike,
    isLeader: profile.role === "lider",
    isMember: profile.role === "membro"
  };
}

export function filterPeopleByAccess(people: Person[], access: AccessContext) {
  if (access.isAdminLike) return people;
  if (access.isMember) return access.profile?.person_id ? people.filter((person) => person.id === access.profile?.person_id) : [];
  if (!access.isLeader) return [];

  return people.filter((person) =>
    access.scopes.some((scope) => {
      if (scope.scope_type === "grupo_familiar") return person.family_group === scope.scope_value;
      if (scope.scope_type === "departamento") return person.departments?.includes(scope.scope_value);
      return false;
    }) || person.assigned_leader === access.person?.name
  );
}

function emptyAccess(): AccessContext {
  return {
    profile: null,
    scopes: [],
    person: null,
    isAdminLike: false,
    isLeader: false,
    isMember: false
  };
}
