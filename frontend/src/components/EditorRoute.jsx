import React from 'react';
import { useLocation } from 'react-router-dom';
import EditorPage from '../pages/EditorPage';

/** URL değişince editör state sıfırlansın / doğru yükleme için remount */
export function EditorRoute() {
  const { pathname } = useLocation();
  return <EditorPage key={pathname} />;
}
