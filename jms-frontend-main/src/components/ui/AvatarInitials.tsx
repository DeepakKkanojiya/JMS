import React from 'react';

interface AvatarInitialsProps {
  name: string;
  size?: number;
}

const COLORS = [
  '#C6A15B', '#2563EB', '#059669', '#7C3AED', '#DC2626',
  '#0891B2', '#D97706', '#4F46E5', '#0D9488', '#BE185D'
];

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

function getColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return COLORS[Math.abs(hash) % COLORS.length];
}

export const AvatarInitials: React.FC<AvatarInitialsProps> = ({ name, size = 34 }) => {
  return (
    <div
      className="avatar-initials"
      style={{
        width: size,
        height: size,
        backgroundColor: getColor(name),
        fontSize: `${size * 0.38}px`,
      }}
    >
      {getInitials(name)}
    </div>
  );
};
