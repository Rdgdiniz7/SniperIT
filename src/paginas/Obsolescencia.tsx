import { useMemo } from 'react';
import { useInventario } from '../contextos/InventarioContext';
import { moeda, sim } from '../utilitarios/formatadores';
import type { Ativo } from '../tipos/Ativo';

export default function Obsolescencia() {
  const { ativos } = useInventario();

  const rows = useMemo(
    () =>
      ativos
        .filter(
          (a: Ativo) =>
            sim(a.isObsolete) || a.plannedReplacementYear
        )
        .sort(
          (a: Ativo, b: Ativo) =>
            (a.plannedReplacementYear || '9999').localeCompare(
              b.plannedReplacementYear || '9999'
            )
        ),
    [ativos]
  );

  const total = rows.reduce(
    (s: number, a: Ativo) =>
      s + (a.replacementCost ?? 0),
    0
  );

  return (
    <>
      <div className="page-title">
        <div>
          <h1>Obsolescência e Replacement Plan</h1>
          <p>
            Planejamento baseado em Is Obsolete?, Obsolete Year e
            Planned Replacement Year.
          </p>
        </div>

        <div className="big-number">
          <span>Custo de reposição</span>
          <b>{moeda(total)}</b>
        </div>
      </div>

      <div className="panel table-wrap">
        <table>
          <thead>
            <tr>
              <th>Hostname</th>
              <th>Location</th>
              <th>Modelo</th>
              <th>Obsoleto?</th>
              <th>Obsolete Year</th>
              <th>Replacement Year</th>
              <th>CAPEX</th>
              <th>Replacement Cost</th>
            </tr>
          </thead>

          <tbody>
            {rows.map((a: Ativo) => (
              <tr key={a.id}>
                <td><b>{a.hostname || '—'}</b></td>
                <td>{a.location || '—'}</td>
                <td>{a.model || '—'}</td>

                <td>
                  <span
                    className={`badge ${
                      sim(a.isObsolete) ? 'danger' : ''
                    }`}
                  >
                    {a.isObsolete || '—'}
                  </span>
                </td>

                <td>{a.obsoleteYear || '—'}</td>
                <td>{a.plannedReplacementYear || '—'}</td>
                <td>{a.capex || '—'}</td>
                <td>{moeda(a.replacementCost)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}