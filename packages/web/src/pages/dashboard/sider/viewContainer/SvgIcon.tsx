interface SvgIconProps {
  svg: string
  size?: number
  className?: string
}

const injectSvgSize = (svg: string, size: number) =>
  svg.replace(
    '<svg',
    `<svg width="${size}" height="${size}" focusable="false" aria-hidden="true"`,
  )

const SvgIcon = ({ svg, size = 24, className }: SvgIconProps) => {
  return (
    <span
      className={className}
      style={{
        display: 'inline-flex',
        width: size,
        height: size,
        flexShrink: 0,
        overflow: 'hidden',
        color: 'currentColor',
      }}
      aria-hidden
      dangerouslySetInnerHTML={{
        __html: injectSvgSize(svg, size),
      }}
    />
  )
}

export default SvgIcon
