export const getRankBadgePath = (role?: string): string => {
  if (!role) return "/ranks/user.png";
  const r = role.toLowerCase().trim();
  if (r.includes("neroferno")) return "/ranks/rank-neroferno.png";
  if (r.includes("killu")) return "/ranks/rank-killu.png";
  if (r.includes("fundador") || r.includes("founder")) return "/ranks/rank-fundador.png";
  if (r.includes("donador") || r.includes("donor")) return "/ranks/rank-donador.png";
  if (r.includes("developer") || r.includes("dev")) return "/ranks/developer.png";
  if (r.includes("admin")) return "/ranks/admin.png";
  if (r.includes("staff")) return "/ranks/staff.png";
  if (r.includes("mod")) return "/ranks/moderator.png";
  if (r.includes("helper")) return "/ranks/helper.png";
  return "/ranks/user.png";
};

export const getRankDisplayName = (role?: string): string => {
  if (!role) return "Usuario";
  const r = role.toLowerCase().trim();
  if (r.includes("neroferno")) return "Neroferno";
  if (r.includes("killu")) return "Killuwu";
  if (r.includes("fundador") || r.includes("founder")) return "Fundador";
  if (r.includes("donador") || r.includes("donor")) return "Donador";
  if (r.includes("developer") || r.includes("dev")) return "Developer";
  if (r.includes("admin")) return "Admin";
  if (r.includes("staff")) return "Staff";
  if (r.includes("mod")) return "Moderador";
  if (r.includes("helper")) return "Helper";
  return role.charAt(0).toUpperCase() + role.slice(1);
};
