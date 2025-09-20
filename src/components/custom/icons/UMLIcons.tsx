import * as React from "react";

type SvgProps = React.SVGProps<SVGSVGElement>;

const base = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

/** Clase: rectángulo con 3 compartimentos */
export function UmlClassIcon(props: SvgProps) {
  return (
    <svg {...base} {...props}>
      <rect x="4" y="3" width="16" height="18" rx="2" />
      <line x1="4" y1="9" x2="20" y2="9" />
      <line x1="4" y1="15" x2="20" y2="15" />
    </svg>
  );
}

/** Interfaz: encabezado con «<< >>» sugerido (sin texto) y secciones */
export function UmlInterfaceIcon(props: SvgProps) {
  return (
    <svg {...base} {...props}>
      <rect x="4" y="3" width="16" height="18" rx="2" />
      <path d="M7 7 h3 M14 7 h3" /> {/* marcas tipo «<< >>» */}
      <line x1="4" y1="10" x2="20" y2="10" />
      <line x1="4" y1="15" x2="20" y2="15" />
    </svg>
  );
}

/** Enum: cabecera + lista */
export function UmlEnumIcon(props: SvgProps) {
  return (
    <svg {...base} {...props}>
      <rect x="4" y="3" width="16" height="18" rx="2" />
      <line x1="4" y1="9" x2="20" y2="9" />
      <line x1="7" y1="12" x2="17" y2="12" />
      <line x1="7" y1="15" x2="17" y2="15" />
      <line x1="7" y1="18" x2="14" y2="18" />
    </svg>
  );
}

/** Paquete: carpeta */
export function UmlPackageIcon(props: SvgProps) {
  return (
    <svg {...base} {...props}>
      <path d="M3 7h5l2 2h11v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z" />
      <path d="M3 7V6a2 2 0 0 1 2-2h4l2 2h5" />
    </svg>
  );
}

/** Atributo: + nombre: tipo (símbolo + línea) */
export function UmlAttributeIcon(props: SvgProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="6.5" cy="12" r="2" />
      <line x1="6.5" y1="11" x2="6.5" y2="13" />
      <line x1="5.5" y1="12" x2="7.5" y2="12" />
      <line x1="11" y1="12" x2="19" y2="12" />
    </svg>
  );
}

/** Método: f(x) → retorno (paréntesis + flecha) */
export function UmlMethodIcon(props: SvgProps) {
  return (
    <svg {...base} {...props}>
      <path d="M4 12c0-2 2-4 4-4s4 2 4 4-2 4-4 4-4-2-4-4z" />
      <path d="M6 12h4" />
      <path d="M14 12h3" />
      <path d="M20 12l-3-2v4l3-2z" />
    </svg>
  );
}

/** Asociación: flecha simple */
export function UmlAssociationIcon(props: SvgProps) {
  return (
    <svg {...base} {...props}>
      <line x1="3" y1="12" x2="17" y2="12" />
      <path d="M17 12l-3-3M17 12l-3 3" />
    </svg>
  );
}

/** Herencia (Generalization): triángulo vacío */
export function UmlGeneralizationIcon(props: SvgProps) {
  return (
    <svg {...base} {...props}>
      <line x1="3" y1="12" x2="15" y2="12" />
      <path d="M21 12l-4-3v6l4-3z" fill="white" />
    </svg>
  );
}

/** Realización: triángulo vacío + línea discontinua */
export function UmlRealizationIcon(props: SvgProps) {
  return (
    <svg {...base} {...props}>
      <path d="M3 12h9" strokeDasharray="4 3" />
      <path d="M21 12l-4-3v6l4-3z" fill="white" />
    </svg>
  );
}

/** Dependencia: flecha abierta + línea discontinua */
export function UmlDependencyIcon(props: SvgProps) {
  return (
    <svg {...base} {...props}>
      <path d="M3 12h10" strokeDasharray="4 3" />
      <path d="M20 12l-4-2M20 12l-4 2" />
    </svg>
  );
}

/** Agregación: rombo hueco (en el lado del “todo”) */
export function UmlAggregationIcon(props: SvgProps) {
  return (
    <svg {...base} {...props}>
      <path d="M3 12h10" />
      <path d="M20 12l-2-2-2 2 2 2 2-2z" fill="white" />
    </svg>
  );
}

/** Composición: rombo lleno (en el lado del “todo”) */
export function UmlCompositionIcon(props: SvgProps) {
  return (
    <svg {...base} {...props}>
      <path d="M3 12h10" />
      <path d="M20 12l-2-2-2 2 2 2 2-2z" />
    </svg>
  );
}

/** Nota/Comentario UML */
export function UmlNoteIcon(props: SvgProps) {
  return (
    <svg {...base} {...props}>
      <path d="M7 3h7l5 5v11a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z" />
      <path d="M14 3v5h5" />
    </svg>
  );
}
