export default function AccountPage({ user }: any) {
  if (!user) {
    return <div className="p-8">Utilisateur non connecté</div>
  }

  return (
    <div className="max-w-3xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Mon compte</h1>

      <div className="bg-white rounded-xl shadow p-6 space-y-3">
        <p>
          <strong>Email :</strong> {user.email}
        </p>

        <p>
          <strong>Nom complet :</strong>{' '}
          {user.full_name || 'Non renseigné'}
        </p>

        <p>
          <strong>Rôle :</strong> {user.role}
        </p>
      </div>
    </div>
  )
}
