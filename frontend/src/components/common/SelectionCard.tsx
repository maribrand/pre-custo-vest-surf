import './SelectionCard.css';

interface SelectionCardProps {
    title: string;
    imageUrl?: string;
    price?: string;
    selected?: boolean;
    onClick: () => void;
}

export function SelectionCard({ title, imageUrl, price, selected, onClick }: SelectionCardProps) {
    return (
        <div
            className={`selection-card ${selected ? 'selected' : ''}`}
            onClick={onClick}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    onClick();
                }
            }}
        >
            <div className="selection-card__image">
                {imageUrl ? (
                    <img src={imageUrl} alt={title} />
                ) : (
                    <div className="selection-card__placeholder">
                        {/* Using a simple generic pattern or just text if no icon available */}
                        📷
                    </div>
                )}
            </div>

            <div className="selection-card__check">✓</div>

            <div className="selection-card__content">
                <h4 className="selection-card__title">{title}</h4>
                {price && <span className="selection-card__price">{price}</span>}
            </div>
        </div>
    );
}
