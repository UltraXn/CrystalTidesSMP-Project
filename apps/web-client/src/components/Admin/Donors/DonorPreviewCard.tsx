import { Donor } from './DonorFormModal';

interface DonorPreviewCardProps {
  formData: Donor;
}

export function DonorPreviewCard({ formData }: Readonly<DonorPreviewCardProps>) {
  return (
    <div className="donor-preview-pane">
      <span
        style={{
          fontSize: '0.7rem',
          fontWeight: 900,
          color: 'rgba(255,255,255,0.2)',
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
        }}
      >
        Preview
      </span>
      <div
        className="donor-card-premium"
        style={{
          width: '100%',
          pointerEvents: 'none',
          background: 'rgba(255,255,255,0.02)',
        }}
      >
        <div className="donor-card-header">
          <div className="donor-avatar-wrapper">
            <img
              className="donor-avatar"
              src={
                formData.isPremium
                  ? `https://mc-heads.net/avatar/${formData.name}/64`
                  : formData.skinUrl
              }
              alt="preview"
              onError={(e) => {
                e.currentTarget.src = `https://mc-heads.net/avatar/Steve/64`;
              }}
            />
          </div>
          <div className="donor-info">
            <h4 className="donor-name">{formData.name || 'New Donor'}</h4>
            <div className="donor-ranks">
              {formData.ranks.map((r) => (
                <span key={r} className="donor-rank-badge">
                  {r}
                </span>
              ))}
            </div>
          </div>
        </div>
        <p className="donor-description" style={{ fontSize: '0.8rem' }}>
          "{formData.description || 'Description goes here...'}"
        </p>
      </div>
    </div>
  );
}
