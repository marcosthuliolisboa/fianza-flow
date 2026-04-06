"use client";

import React, { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { MessageCircle } from "lucide-react";

function formatBRL(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value || 0);
}

function formatarMoeda(valor: string): string {
  const apenasNumeros = valor.replace(/\D/g, "");
  const centavos = parseInt(apenasNumeros, 10) || 0;
  const reais = centavos / 100;

  return reais.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function parseMoeda(str: string): number {
  const cleaned = str.replace(/\./g, "").replace(",", ".");
  return Number(cleaned) || 0;
}

function calcularQ0(p: number, j: number, n: number) {
  if (j === 0) return p * n;
  return ((1 - Math.pow(1 + j, -n)) / j) * p;
}

export default function App() {
  const [aluguelStr, setAluguelStr] = useState("");
  const [percentual, setPercentual] = useState(90);
  const [meses, setMeses] = useState(12);

  const aluguel = parseMoeda(aluguelStr);
  const taxa = 0.04; // FIXA 4%

  const data = useMemo(() => {
    const parcela = aluguel * (percentual / 100);
    const antecipado = calcularQ0(parcela, taxa, meses);

    return { parcela, antecipado };
  }, [aluguel, percentual, meses]);

  function enviarWhatsApp() {
    const msg = `Oi, tenho interesse em ANTECIPAR MEU ALUGUEL.
Hoje recebo ${formatBRL(aluguel)} de aluguel
Tenho interesse em antecipar ${formatBRL(data.antecipado)}.`;

    const url = `https://wa.me/5533998531374?text=${encodeURIComponent(msg)}`;
    window.open(url, "_blank");
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      {/* HEADER FIXO COM LOGO E VALOR */}
      <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm border-b border-slate-200 shadow-sm">
        <div className="max-w-md mx-auto px-4 py-4">
          {/* LOGO */}
          <div className="flex justify-center mb-3">
            <img 
              src="/logo-fianza.png" 
              alt="Fianza" 
              className="h-16 object-contain"
            />
          </div>
          
          <div className="text-center">
            <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">
              Valor antecipado
            </p>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">
              {formatBRL(data.antecipado)}
            </h1>
          </div>
        </div>
      </div>

      {/* CONTEÚDO */}
      <div className="p-4 md:p-6 flex justify-center items-start">
        <div className="w-full max-w-md space-y-6 py-4">
          {/* CARD PRINCIPAL */}
          <Card className="border-0 shadow-xl bg-slate-100">
            <CardContent className="p-6">
              <div className="space-y-6">
                {/* Valor do Aluguel */}
                <div className="space-y-2">
                  <Label htmlFor="aluguel" className="text-sm font-medium text-slate-700">
                    Valor do aluguel (R$)
                  </Label>
                  <Input
                    id="aluguel"
                    type="text"
                    inputMode="numeric"
                    placeholder="0,00"
                    value={aluguelStr}
                    onChange={(e) => setAluguelStr(formatarMoeda(e.target.value))}
                    className="h-12 text-lg font-medium bg-white border-slate-200 focus:border-slate-400 focus:ring-slate-400"
                  />
                </div>

                {/* Percentual */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <Label className="text-sm font-medium text-slate-700">
                      % de uso do aluguel
                    </Label>
                    <span className="text-lg font-bold text-slate-900 bg-white px-3 py-1 rounded-lg">
                      {percentual}%
                    </span>
                  </div>
                  <Slider
                    value={[percentual]}
                    onValueChange={(value) => setPercentual(value[0])}
                    min={40}
                    max={90}
                    step={1}
                    className="py-2"
                  />
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>40%</span>
                    <span>90%</span>
                  </div>
                </div>

                {/* Prazo */}
                <div className="space-y-2">
                  <Label htmlFor="meses" className="text-sm font-medium text-slate-700">
                    Prazo
                  </Label>
                  <div className="flex items-center gap-3">
                    <Input
                      id="meses"
                      type="number"
                      min={2}
                      max={12}
                      value={meses}
                      onChange={(e) => setMeses(Number(e.target.value))}
                      className="h-12 text-lg font-medium bg-white border-slate-200 focus:border-slate-400 focus:ring-slate-400"
                    />
                    <span className="text-lg font-medium text-slate-700">meses</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* BOTÃO WHATSAPP */}
          <div className="text-center">
            <Button
              onClick={enviarWhatsApp}
              size="lg"
              className="h-14 px-10 text-lg font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <MessageCircle className="mr-2 h-5 w-5" />
              SOLICITAR VIA WHATSAPP
            </Button>
          </div>

          {/* FOOTER */}
          <p className="text-center text-xs text-slate-400 pt-4">
            Simulação sujeita a análise de crédito.
          </p>
        </div>
      </div>
    </div>
  );
}
