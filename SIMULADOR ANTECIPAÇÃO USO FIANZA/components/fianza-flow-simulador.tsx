import React, { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

function formatBRL(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(Number.isFinite(value) ? value : 0);
}

// Máscara monetária: preenche da direita para esquerda (centavos primeiro)
function formatarMoeda(valor: string): string {
  // Remove tudo que não é número
  const apenasNumeros = valor.replace(/\D/g, "");
  
  // Converte para número inteiro (centavos)
  const centavos = parseInt(apenasNumeros, 10) || 0;
  
  // Converte para reais (divide por 100)
  const reais = centavos / 100;
  
  // Formata com separadores brasileiros
  return reais.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

// Converte string formatada para número
function parseMoeda(str: string): number {
  const cleaned = str.replace(/\./g, "").replace(",", ".");
  return Number(cleaned) || 0;
}

function calcularQ0(p: number, j: number, n: number) {
  if (j === 0) return p * n;
  return ((1 - Math.pow(1 + j, -n)) / j) * p;
}

// Cálculo inverso: dado Q0, taxa e prazo, qual é a parcela necessária?
function calcularParcela(q0: number, j: number, n: number) {
  if (j === 0) return q0 / n;
  return q0 * j / (1 - Math.pow(1 + j, -n));
}

export default function FianzaFlowSimulador() {
  const [aluguelStr, setAluguelStr] = useState("");
  const [percentualUso, setPercentualUso] = useState(90);
  const [meses, setMeses] = useState(12);
  const [taxaStr, setTaxaStr] = useState("4,00");
  const [valorAntecipadoStr, setValorAntecipadoStr] = useState("");

  const aluguel = parseMoeda(aluguelStr);
  const taxa = parseMoeda(taxaStr);
  const valorAntecipadoCustom = parseMoeda(valorAntecipadoStr);

const data = useMemo(() => {
    const liquido = aluguel * 0.9;
    const taxaDecimal = taxa / 100;
    
    // Calcula o máximo possível com o slider atual
    const parcelaMaxima = liquido * (percentualUso / 100);
    const q0Maximo = calcularQ0(parcelaMaxima, taxaDecimal, meses);
    
    // Se o usuário definiu um valor personalizado, recalcula tudo inversamente
    if (valorAntecipadoCustom > 0) {
      const q0 = Math.min(valorAntecipadoCustom, q0Maximo);
      const parcelaCalculada = calcularParcela(q0, taxaDecimal, meses);
      const percentualCalculado = liquido > 0 ? (parcelaCalculada / liquido) * 100 : 0;
      
      return { 
        liquido, 
        parcela: parcelaCalculada, 
        q0, 
        q0Maximo,
        percentualUsoCalculado: percentualCalculado,
        sobraMensal: liquido - parcelaCalculada
      };
    }
    
    // Sem valor personalizado, usa o slider normalmente
    return { 
      liquido, 
      parcela: parcelaMaxima, 
      q0: q0Maximo, 
      q0Maximo,
      percentualUsoCalculado: percentualUso,
      sobraMensal: liquido - parcelaMaxima
    };
  }, [aluguel, percentualUso, meses, taxa, valorAntecipadoCustom]);

return (
    <div className="min-h-screen bg-white">
      {/* RESULTADO PRINCIPAL - FIXO NO TOPO */}
      <div className="sticky top-0 z-50 bg-white py-6 border-b shadow-sm">
        <div className="flex flex-col items-center justify-center">
          <p className="text-sm text-gray-500 mb-2">Valor antecipado</p>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
            {formatBRL(data.q0)}
          </h1>
          <p className="text-xs text-gray-400 mt-3">
            {valorAntecipadoCustom > 0 
              ? `Máximo disponível: ${formatBRL(data.q0Maximo)}`
              : "baseado na sua configuração atual"
            }
          </p>
        </div>
      </div>

      <div className="p-6">
        <div className="w-full max-w-4xl mx-auto space-y-6">

          {/* VALOR ANTECIPADO PERSONALIZADO */}
          <div className="max-w-xs mx-auto">
            <Label className="text-center block mb-2">Deseja antecipar um valor específico? (R$)</Label>
            <Input
              type="text"
              inputMode="numeric"
              placeholder="Deixe vazio para usar o máximo"
              value={valorAntecipadoStr}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, "");
                if (val === "" || val === "0") {
                  setValorAntecipadoStr("");
                } else {
                  setValorAntecipadoStr(formatarMoeda(e.target.value));
                }
              }}
              className="text-center"
            />
          </div>

        {/* CARD PRINCIPAL */}
        <Card className="rounded-2xl shadow-sm border">
          <CardContent className="grid md:grid-cols-2 gap-6 p-6">

            {/* COLUNA 1 */}
            <div className="space-y-5">
<div>
                <Label>Valor do aluguel (R$)</Label>
                <Input
                  type="text"
                  inputMode="numeric"
                  placeholder="Digite o valor do aluguel"
                  value={aluguelStr}
                  onChange={(e) => setAluguelStr(formatarMoeda(e.target.value))}
                />
              </div>

              <div>
                <Label>% de uso do aluguel</Label>
                <Slider
                  value={[percentualUso]}
                  min={0}
                  max={100}
                  step={1}
                  onValueChange={(v) => setPercentualUso(v[0])}
                />
                <p className="text-sm text-gray-500 mt-1">
                  {percentualUso}% do valor líquido
                </p>
              </div>

              <div>
                <Label>Prazo (meses)</Label>
                <Input
                  type="number"
                  min={2}
                  max={12}
                  value={meses}
                  onChange={(e) => setMeses(Number(e.target.value))}
                />
              </div>

<div>
                <Label>Taxa de juros (% ao mês)</Label>
                <Input
                  type="text"
                  inputMode="numeric"
                  placeholder="0,00"
                  value={taxaStr}
                  onChange={(e) => setTaxaStr(formatarMoeda(e.target.value))}
                />
              </div>
            </div>

            {/* COLUNA 2 */}
            <div className="bg-gray-50 rounded-2xl p-6 space-y-4">
              <div>
                <p className="text-sm text-gray-500">Aluguel líquido</p>
                <p className="text-lg font-semibold">{formatBRL(data.liquido)}</p>
              </div>

<div>
                <p className="text-sm text-gray-500">% do aluguel usado</p>
                <p className="text-lg font-semibold">
                  {data.percentualUsoCalculado.toFixed(2)}%
                </p>
              </div>

              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm text-gray-500">Valor usado por mês</p>
                  <p className="text-lg font-semibold">{formatBRL(data.parcela)}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Sobra mensal</p>
                  <p className="text-lg font-semibold text-emerald-600">
                    {formatBRL(data.sobraMensal)}
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t">
                <p className="text-sm text-gray-500">Total ao longo do período</p>
                <p className="text-lg font-semibold">
                  {formatBRL(data.parcela * meses)}
                </p>
              </div>
            </div>

</CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
