import React, { Fragment, useState } from 'react';
import { useEditorStore } from '../../store/useEditorStore';
import { sanitizeHref } from '../../lib/url';
import { cn } from '../../lib/cn';

const HEADING_TAGS = new Set(['h1', 'h2', 'h3', 'h4', 'h5', 'h6']);

const makeComponents = (builderChrome) => ({
  Section: ({ children, className, ...props }) => (
    <section
      className={cn(builderChrome && 'builder-element min-h-[100px]', className)}
      {...props}
    >
      {children}
    </section>
  ),
  Container: ({ children, className, ...props }) => (
    <div className={cn(builderChrome && 'builder-element min-h-[50px]', className)} {...props}>
      {children}
    </div>
  ),
  /** className ile flex veya grid seçilir; zorunlu `grid` koymayın (CTA şeridi vb. flex kırılırdı). */
  Grid: ({ children, className, ...props }) => (
    <div className={cn(builderChrome && 'builder-element min-h-[40px]', className)} {...props}>
      {children}
    </div>
  ),
  Heading: ({ text, children, className, level = 'h2', href, targetBlank, ...props }) => {
    const Tag = HEADING_TAGS.has(level) ? level : 'h2';
    const safe = sanitizeHref(href);
    const inner = (
      <>
        {text}
        {children}
      </>
    );
    return (
      <Tag className={cn(builderChrome && 'builder-element outline-none', className)} {...props}>
        {safe ? (
          <a
            href={safe}
            target={targetBlank ? '_blank' : undefined}
            rel={targetBlank ? 'noopener noreferrer' : undefined}
            className="text-inherit no-underline hover:underline decoration-current underline-offset-2"
          >
            {inner}
          </a>
        ) : (
          inner
        )}
      </Tag>
    );
  },
  Text: ({ text, children, className, href, targetBlank, ...props }) => {
    const safe = sanitizeHref(href);
    const inner = (
      <>
        {text}
        {children}
      </>
    );
    return (
      <p className={cn(builderChrome && 'builder-element outline-none', className)} {...props}>
        {safe ? (
          <a
            href={safe}
            target={targetBlank ? '_blank' : undefined}
            rel={targetBlank ? 'noopener noreferrer' : undefined}
            className="text-inherit underline-offset-2 hover:underline"
          >
            {inner}
          </a>
        ) : (
          inner
        )}
      </p>
    );
  },
  Button: ({ text, children, className, type = 'button', href, targetBlank, ...props }) => {
    const safe = sanitizeHref(href);
    const classes = cn(
      builderChrome && 'builder-element inline-flex items-center justify-center',
      !builderChrome && 'inline-flex items-center justify-center',
      className
    );
    const hasChildren = children != null && React.Children.count(children) > 0;
    // Çocuk varsa <button> içinde <button> yasak — grup <div role="group">; metin linki ayrı <a>
    if (hasChildren) {
      return (
        <div
          role="group"
          className={cn(classes, 'flex flex-col items-stretch gap-2')}
          {...props}
        >
          {safe ? (
            <a
              href={safe}
              target={targetBlank ? '_blank' : undefined}
              rel={targetBlank ? 'noopener noreferrer' : undefined}
              className="inline-flex items-center justify-center"
            >
              {text}
            </a>
          ) : (
            text != null &&
            text !== '' && (
              <span className="inline-flex items-center justify-center">{text}</span>
            )
          )}
          {children}
        </div>
      );
    }
    if (safe) {
      return (
        <a
          href={safe}
          target={targetBlank ? '_blank' : undefined}
          rel={targetBlank ? 'noopener noreferrer' : undefined}
          className={classes}
          {...props}
        >
          {text}
          {children}
        </a>
      );
    }
    return (
      <button type={type} className={classes} {...props}>
        {text}
        {children}
      </button>
    );
  },
  Link: ({ text, children, className, href, targetBlank, ...props }) => {
    const safe = sanitizeHref(href);
    const classes = cn(
      builderChrome && 'builder-element text-blue-600 underline underline-offset-2 hover:text-blue-800',
      !builderChrome && 'text-blue-600 underline underline-offset-2 hover:text-blue-800',
      className
    );
    if (!safe) {
      return (
        <span className={cn(classes, 'cursor-default opacity-80')} {...props}>
          {text || 'Link'}
          {children}
        </span>
      );
    }
    return (
      <a
        href={safe}
        target={targetBlank ? '_blank' : undefined}
        rel={targetBlank ? 'noopener noreferrer' : undefined}
        className={classes}
        {...props}
      >
        {text || 'Link'}
        {children}
      </a>
    );
  },
  // img void element — çocukları span içinde (React 19 hatası önlenir); isteğe bağlı tıklama linki
  Image: ({ src, alt, className, children, linkHref, targetBlank, ...props }) => {
    const safeLink = sanitizeHref(linkHref);
    const imgEl = (
      <img
        src={src || 'https://via.placeholder.com/300'}
        alt={alt || 'Image'}
        className="max-w-full h-auto object-cover rounded block"
        draggable={false}
      />
    );
    const wrapped = safeLink ? (
      <a
        href={safeLink}
        target={targetBlank ? '_blank' : undefined}
        rel={targetBlank ? 'noopener noreferrer' : undefined}
        className="block"
      >
        {imgEl}
      </a>
    ) : (
      imgEl
    );
    return (
      <span
        className={cn(
          builderChrome && 'builder-element inline-block max-w-full align-top',
          !builderChrome && 'inline-block max-w-full align-top',
          className
        )}
        {...props}
      >
        {wrapped}
        {children}
      </span>
    );
  },
  Card: ({ children, className, ...props }) => (
    <div
      className={cn(
        builderChrome && 'builder-element',
        'bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-100 dark:border-gray-800 p-6',
        className
      )}
      {...props}
    >
      {children}
    </div>
  ),
});

const COMPONENTS_EDITOR = makeComponents(true);
const COMPONENTS_PREVIEW = makeComponents(false);

const CHILD_CONTAINER_TYPES = ['Section', 'Container', 'Grid', 'Card'];

/** Figma benzeri: kardeşler arasına tam indeksle bırakma */
function InsertDropSlot({ parentId, slotIndex, parentClassName, mode }) {
  const isPreview = mode === 'preview';
  const moveElementToIndex = useEditorStore((s) => s.moveElementToIndex);
  const [active, setActive] = useState(false);
  if (isPreview) return null;

  const pc = parentClassName || '';
  const flexRow = /\bflex\b/.test(pc) && !/\bflex-col\b/.test(pc);

  return (
    <div
      role="presentation"
      className={cn(
        'shrink-0 transition-colors z-[2]',
        flexRow ? 'w-2 min-h-[36px] self-stretch -mx-0.5' : 'w-full min-h-[12px] -my-1.5',
        active && 'rounded-sm bg-blue-500/35 ring-2 ring-blue-500/80'
      )}
      onDragOver={(e) => {
        e.preventDefault();
        e.stopPropagation();
        e.dataTransfer.dropEffect = 'move';
        setActive(true);
      }}
      onDragLeave={(e) => {
        e.stopPropagation();
        if (!e.currentTarget.contains(e.relatedTarget)) setActive(false);
      }}
      onDrop={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setActive(false);
        const sourceId = e.dataTransfer.getData('sourceId');
        if (sourceId) moveElementToIndex(sourceId, parentId, slotIndex);
      }}
    />
  );
}

export const Renderer = ({ node, mode = 'editor' }) => {
  const isPreview = mode === 'preview';
  const setSelectedElement = useEditorStore((s) => s.setSelectedElement);
  const moveElement = useEditorStore((s) => s.moveElement);
  const isSelected = useEditorStore((s) => !isPreview && s.selectedElementId === node.id);
  const [isDragOver, setIsDragOver] = useState(false);

  const registry = isPreview ? COMPONENTS_PREVIEW : COMPONENTS_EDITOR;
  const Component = registry[node.type];
  if (!Component) return null;
  const isRoot = node.id === 'root';

  const handleDragStart = (e) => {
    if (isPreview || isRoot) return;
    e.stopPropagation();
    e.dataTransfer.setData('sourceId', node.id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    if (isPreview) return;
    e.preventDefault();
    e.stopPropagation();
    if (CHILD_CONTAINER_TYPES.includes(node.type)) {
      setIsDragOver(true);
      e.dataTransfer.dropEffect = 'move';
    } else {
      e.dataTransfer.dropEffect = 'none';
    }
  };

  const handleDragLeave = (e) => {
    if (isPreview) return;
    e.preventDefault();
    e.stopPropagation();
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setIsDragOver(false);
    }
  };

  const handleDrop = (e) => {
    if (isPreview) return;
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const sourceId = e.dataTransfer.getData('sourceId');
    if (!sourceId || sourceId === node.id) return;

    if (CHILD_CONTAINER_TYPES.includes(node.type)) {
      moveElement(sourceId, node.id);
    }
  };

  const isDropContainer = CHILD_CONTAINER_TYPES.includes(node.type);
  const childrenList = node.children || [];
  const showInsertSlots = !isPreview && isDropContainer;

  const renderedChildren =
    showInsertSlots && childrenList.length === 0 ? (
      <InsertDropSlot
        parentId={node.id}
        slotIndex={0}
        parentClassName={node.props?.className}
        mode={mode}
      />
    ) : showInsertSlots ? (
      <Fragment>
        <InsertDropSlot
          parentId={node.id}
          slotIndex={0}
          parentClassName={node.props?.className}
          mode={mode}
        />
        {childrenList.map((child, i) => (
          <Fragment key={child.id}>
            <Renderer node={child} mode={mode} />
            <InsertDropSlot
              parentId={node.id}
              slotIndex={i + 1}
              parentClassName={node.props?.className}
              mode={mode}
            />
          </Fragment>
        ))}
      </Fragment>
    ) : (
      childrenList.map((child) => <Renderer key={child.id} node={child} mode={mode} />)
    );

  return (
    <Component
      {...node.props}
      draggable={!isPreview && !isRoot}
      onDragStart={isPreview ? undefined : handleDragStart}
      onDragOver={isPreview ? undefined : handleDragOver}
      onDragLeave={isPreview ? undefined : handleDragLeave}
      onDrop={isPreview ? undefined : handleDrop}
      className={cn(
        node.props.className,
        isSelected && 'selected relative z-10',
        !isPreview && isDragOver && 'outline-dashed outline-2 outline-blue-500 bg-blue-50/20'
      )}
      onClick={
        isPreview
          ? undefined
          : (e) => {
              e.preventDefault();
              e.stopPropagation();
              setSelectedElement(node.id);
            }
      }
    >
      {renderedChildren}
    </Component>
  );
};
