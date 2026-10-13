import type { Figure, FigureDims, MathItem } from './types'

type Line = { label: string; answer: string }

const NAMES: { figure: Figure; answer: string; dims?: FigureDims }[] = [
  { figure: 'square', answer: 'carré' },
  { figure: 'rectangle', answer: 'rectangle' },
  { figure: 'triangle', answer: 'triangle', dims: { triangleKind: 'scalene' } },
  { figure: 'triangle', answer: 'triangle équilatéral', dims: { triangleKind: 'equilateral' } },
  { figure: 'triangle', answer: 'triangle isocèle', dims: { triangleKind: 'isosceles' } },
  { figure: 'triangle', answer: 'triangle rectangle', dims: { triangleKind: 'right' } },
  { figure: 'trapezoid', answer: 'trapèze', dims: { trapezoidKind: 'isosceles' } },
  { figure: 'parallelogram', answer: 'parallélogramme' },
  { figure: 'rhombus', answer: 'losange' },
  { figure: 'circle', answer: 'cercle' },
  { figure: 'oval', answer: 'ovale' },
  { figure: 'cube', answer: 'cube' },
  { figure: 'cuboid', answer: 'pavé droit' },
  { figure: 'cylinder', answer: 'cylindre' },
  { figure: 'cone', answer: 'cône' },
  { figure: 'sphere', answer: 'sphère' },
]

function lines(rows: Line[]): MathItem['propertyLines'] {
  return rows
}

const PROPERTIES: { figure: Figure; dims?: FigureDims; rows: Line[] }[] = [
  {
    figure: 'square',
    rows: [
      { label: 'Nom', answer: 'carré' },
      { label: 'Côtés égaux', answer: '4' },
      { label: 'Angles droits', answer: '4' },
      { label: 'Axes de symétrie', answer: '4' },
    ],
  },
  {
    figure: 'rectangle',
    rows: [
      { label: 'Nom', answer: 'rectangle' },
      { label: 'Côtés égaux', answer: 'côtés opposés' },
      { label: 'Angles droits', answer: '4' },
      { label: 'Axes de symétrie', answer: '2' },
    ],
  },
  {
    figure: 'rhombus',
    rows: [
      { label: 'Nom', answer: 'losange' },
      { label: 'Côtés égaux', answer: '4' },
      { label: 'Angles opposés', answer: 'égaux' },
      { label: 'Axes de symétrie', answer: '2' },
    ],
  },
  {
    figure: 'parallelogram',
    rows: [
      { label: 'Nom', answer: 'parallélogramme' },
      { label: 'Côtés égaux', answer: 'côtés opposés' },
      { label: 'Angles droits', answer: '0' },
      { label: 'Axes de symétrie', answer: '0' },
    ],
  },
  {
    figure: 'circle',
    rows: [
      { label: 'Nom', answer: 'cercle' },
      { label: 'Côtés', answer: '0' },
      { label: 'Angles droits', answer: '0' },
      { label: 'Axes de symétrie', answer: 'une infinité' },
    ],
  },
  {
    figure: 'oval',
    rows: [
      { label: 'Nom', answer: 'ovale' },
      { label: 'Côtés', answer: '0' },
      { label: 'Axes de symétrie', answer: '2' },
    ],
  },
  {
    figure: 'triangle',
    dims: { triangleKind: 'equilateral' },
    rows: [
      { label: 'Nom', answer: 'triangle équilatéral' },
      { label: 'Côtés égaux', answer: '3' },
      { label: 'Angles droits', answer: '0' },
      { label: 'Axes de symétrie', answer: '3' },
    ],
  },
  {
    figure: 'triangle',
    dims: { triangleKind: 'isosceles' },
    rows: [
      { label: 'Nom', answer: 'triangle isocèle' },
      { label: 'Côtés égaux', answer: '2' },
      { label: 'Angles droits', answer: '0' },
      { label: 'Axes de symétrie', answer: '1' },
    ],
  },
  {
    figure: 'triangle',
    dims: { triangleKind: 'right' },
    rows: [
      { label: 'Nom', answer: 'triangle rectangle' },
      { label: 'Côtés égaux', answer: '0' },
      { label: 'Angles droits', answer: '1' },
      { label: 'Axes de symétrie', answer: '0' },
    ],
  },
  {
    figure: 'triangle',
    dims: { triangleKind: 'scalene' },
    rows: [
      { label: 'Nom', answer: 'triangle quelconque' },
      { label: 'Côtés égaux', answer: '0' },
      { label: 'Angles droits', answer: '0' },
      { label: 'Axes de symétrie', answer: '0' },
    ],
  },
  {
    figure: 'trapezoid',
    dims: { trapezoidKind: 'rectangle' },
    rows: [
      { label: 'Nom', answer: 'trapèze rectangle' },
      { label: 'Côtés parallèles', answer: '1 paire' },
      { label: 'Angles droits', answer: '2' },
      { label: 'Axes de symétrie', answer: '0' },
    ],
  },
  {
    figure: 'trapezoid',
    dims: { trapezoidKind: 'isosceles' },
    rows: [
      { label: 'Nom', answer: 'trapèze isocèle' },
      { label: 'Côtés parallèles', answer: '1 paire' },
      { label: 'Côtés non parallèles', answer: 'égaux' },
      { label: 'Angles droits', answer: '0' },
      { label: 'Axes de symétrie', answer: '1' },
    ],
  },
  {
    figure: 'trapezoid',
    dims: { trapezoidKind: 'scalene' },
    rows: [
      { label: 'Nom', answer: 'trapèze quelconque' },
      { label: 'Côtés parallèles', answer: '1 paire' },
      { label: 'Angles droits', answer: '0' },
      { label: 'Axes de symétrie', answer: '0' },
    ],
  },
]

export function tryGenerateFigure(typeId: string, index: number): MathItem | null {
  if (typeId === 'figures-nommer') {
    const fig = NAMES[index % NAMES.length]!
    return {
      layout: 'geo',
      figure: fig.figure,
      dims: fig.dims,
      answer: fig.answer,
    }
  }
  if (typeId === 'figures-proprietes') {
    const fig = PROPERTIES[index % PROPERTIES.length]!
    return {
      layout: 'geo',
      figure: fig.figure,
      dims: fig.dims,
      propertyLines: lines(fig.rows),
      answer: fig.rows.map((row) => `${row.label} : ${row.answer}`).join(' · '),
    }
  }
  return null
}
