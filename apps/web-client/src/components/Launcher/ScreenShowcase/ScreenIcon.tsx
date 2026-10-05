import React from 'react';
import { Play, Layers, FolderTree, Shirt, Users, AlertTriangle } from 'lucide-react';
import type { ScreenItem } from './screenShowcaseData';

export const ScreenIcon: React.FC<
  Readonly<{ iconName: ScreenItem['iconName']; className?: string }>
> = ({ iconName, className = 'size-4' }) => {
  switch (iconName) {
    case 'play':
      return <Play className={`${className} text-teal-400`} />;
    case 'layers':
      return <Layers className={`${className} text-purple-400`} />;
    case 'folder':
      return <FolderTree className={`${className} text-teal-400`} />;
    case 'shirt':
      return <Shirt className={`${className} text-amber-400`} />;
    case 'users':
      return <Users className={`${className} text-sky-400`} />;
    case 'alert':
      return <AlertTriangle className={`${className} text-red-400`} />;
  }
};
