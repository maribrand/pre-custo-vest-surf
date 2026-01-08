import type { UserRole } from '../../App';
import './UserSelector.css';

interface UserSelectorProps {
  currentRole: UserRole | null;
  onSelectRole: (role: UserRole) => void;
}

const options: { label: string; value: UserRole; description: string }[] = [
  {
    label: 'Admin / Precificação',
    value: 'admin',
    description: 'Cadastrar tipos de cliente, modelos, categorias e variações.',
  },
  {
    label: 'PCP / Interno',
    value: 'pcp',
    description: 'Visualiza todo o simulador detalhado (base + adicionais).',
  },
  {
    label: 'Representante / Comercial',
    value: 'rep',
    description: 'Simula com visão simplificada, sem mostrar cada valor adicional.',
  },
];

export function UserSelector({ currentRole, onSelectRole }: UserSelectorProps) {
  return (
    <section className="user-selector">
      <h2>Quem está usando o app?</h2>
      <div className="user-selector__options">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            className={`user-selector__card ${currentRole === option.value ? 'is-active' : ''}`}
            onClick={() => onSelectRole(option.value)}
          >
            <strong>{option.label}</strong>
            <span>{option.description}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
