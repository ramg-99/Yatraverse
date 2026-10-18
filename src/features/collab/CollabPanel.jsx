export function CollabPanel({ trip }) {
  const collaborators = trip.collaborators || [];

  return (
    <section className="glass mt-6 rounded-2xl p-5">
      <h2 className="font-display text-2xl">Travel crew</h2>
      <p className="mt-2 text-sm text-muted">
        {collaborators.length ? `${collaborators.length} collaborator${collaborators.length === 1 ? '' : 's'} connected.` : 'You are planning this trip solo.'}
      </p>
    </section>
  );
}

export default CollabPanel;