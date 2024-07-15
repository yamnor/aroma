// app/page.tsx
"use client";

import React, { useState, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  ChevronDown,
  ChevronUp,
  ArrowUpDown,
  ExternalLink,
  Box,
  HelpCircle,
  Info,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  fragranceData,
  fragranceCategories,
  compoundTypes,
} from "../data/fragranceData";
import dynamic from "next/dynamic";

const MoleculeViewer = dynamic(() => import("./components/MoleculeViewer"), {
  ssr: false,
});

type FragranceData = {
  molecularFormula: string;
  molecularWeight: number;
  category: keyof typeof fragranceCategories;
  compoundType: string;
  source: string;
  pubchemId: number;
  smiles: string;
  fragrance: string;
};

function FragranceAnalysisApp() {
  const [sortBy, setSortBy] = useState<string>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [isMobile, setIsMobile] = useState(false);

  const [selectedMolecule, setSelectedMolecule] = useState(null);

  React.useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const getPubChemLink = (pubchemId: number) => {
    return `https://pubchem.ncbi.nlm.nih.gov/compound/${pubchemId}`;
  };

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("asc");
    }
  };

  const sortedFragrances = useMemo(() => {
    return Object.entries(fragranceData).sort(
      ([aName, aData], [bName, bData]) => {
        let comparison = 0;
        switch (sortBy) {
          case "name":
            comparison = aName.localeCompare(bName);
            break;
          case "category":
            comparison = aData.category.localeCompare(bData.category);
            break;
          case "source":
            comparison = aData.source.localeCompare(bData.source);
            break;
          case "compoundType":
            comparison = aData.compoundType.localeCompare(bData.compoundType);
            break;
          case "molecularWeight":
            comparison = aData.molecularWeight - bData.molecularWeight;
            break;
          default:
            comparison = 0;
        }
        return sortOrder === "asc" ? comparison : -comparison;
      }
    );
  }, [sortBy, sortOrder]);

  const SortableTableHeader = ({ column, children }: { column: string; children: React.ReactNode }) => (
    <TableHead className="cursor-pointer" onClick={() => handleSort(column)}>
      <div className="flex items-center">
        {children}
        {sortBy === column ? (
          sortOrder === "asc" ? (
            <ChevronUp className="ml-2 h-4 w-4" />
          ) : (
            <ChevronDown className="ml-2 h-4 w-4" />
          )
        ) : (
          <ArrowUpDown className="ml-2 h-4 w-4" />
        )}
      </div>
    </TableHead>
  );

  const HelpContent = () => (
    <div className="space-y-6 overflow-y-auto max-h-[60vh] pr-2">
      <div>
        <p className="mb-2">
          このアプリでは、様々な香料の情報を比較・分析できます。
        </p>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-3">カテゴリー:</h3>
        <div className="grid grid-cols-3 gap-4">
          {Object.entries(fragranceCategories).map(([category, emoji]) => (
            <div
              key={category}
              className="flex items-center bg-gray-100 p-2 rounded"
            >
              <span className="text-2xl mr-3">{emoji}</span>
              <span className="text-sm">{category}</span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-2">操作方法:</h3>
        <ul className="list-disc list-inside space-y-2">
          <li>各列のヘッダーをクリックすると、その列でソートできます。</li>
          <li>
            情報アイコン（
            <Info className="inline h-4 w-4" />
            ）をクリックすると、香りの特徴の詳細が表示されます。
          </li>
          <li>
            3Dアイコン（
            <Box className="inline h-4 w-4" />
            ）をクリックすると、分子の3D構造が表示されます。
          </li>
          <li>
            PubChem IDをクリックすると、その化合物のPubChemページが開きます。
          </li>
        </ul>
      </div>
    </div>
  );

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">香りの分子</h1>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" className="flex items-center">
              ヘルプ
              <HelpCircle className="ml-2 h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl overflow-y-auto">
            <DialogHeader>
              <DialogTitle>ヘルプ</DialogTitle>
            </DialogHeader>
            <HelpContent />
          </DialogContent>
        </Dialog>
      </div>

      {isMobile ? (
        <Accordion type="single" collapsible className="w-full">
          {sortedFragrances.map(([name, data]) => (
            <AccordionItem key={name} value={name}>
              <AccordionTrigger>{name}</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2">
                  <p>
                    <strong>カテゴリー:</strong>{" "}
                    {fragranceCategories[data.category]}
                  </p>
                  <p>
                    <strong>含まれるもの:</strong> {data.source}
                  </p>
                  <p>
                    <strong>化合物の種類:</strong> {data.compoundType}
                  </p>
                  <p>
                    <strong>分子量:</strong> {data.molecularWeight.toFixed(2)}
                  </p>
                  <p>
                    <strong>SMILES:</strong> {data.smiles}
                  </p>
                  <p>
                    <strong>PubChem ID:</strong>
                    <a
                      href={getPubChemLink(data.pubchemId)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-2 text-blue-600 hover:underline"
                    >
                      {data.pubchemId}
                    </a>
                  </p>
                  <div className="flex space-x-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Info size={16} />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>{name}について</DialogTitle>
                        </DialogHeader>
                        <p>{data.fragrance}</p>
                      </DialogContent>
                    </Dialog>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Box size={16} />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-[90vw] w-full max-h-[90vh] flex flex-col p-0">
                        <DialogHeader className="px-4 py-2 border-b">
                          <DialogTitle>{name}の3D構造</DialogTitle>
                        </DialogHeader>
                        <div className="flex-grow overflow-hidden h-[90vh]">
                          <MoleculeViewer pubchemId={data.pubchemId} />
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <SortableTableHeader column="name">名前</SortableTableHeader>
                <SortableTableHeader column="category">
                  カテゴリー
                </SortableTableHeader>
                <SortableTableHeader column="source">
                  含まれるもの
                </SortableTableHeader>
                <SortableTableHeader column="compoundType">
                  種類
                </SortableTableHeader>
                <SortableTableHeader column="molecularWeight">
                  分子量
                </SortableTableHeader>
                <TableHead>詳細</TableHead>
                <TableHead>構造</TableHead>
                <TableHead>PubChem</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedFragrances.map(([name, data]) => (
                <TableRow key={name}>
                  <TableCell>{name}</TableCell>
                  <TableCell>{fragranceCategories[data.category as keyof typeof fragranceCategories]}</TableCell>
                  <TableCell>{data.source}</TableCell>
                  <TableCell>{data.compoundType}</TableCell>
                  <TableCell>{data.molecularWeight.toFixed(2)}</TableCell>
                  <TableCell>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <Info size={16} />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>{name}の詳細情報</DialogTitle>
                        </DialogHeader>
                        <p>{data.fragrance}</p>
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                  <TableCell>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <Box size={16} />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl w-full max-h-[90vh] flex flex-col p-0">
                        <DialogHeader className="px-4 py-2 border-b">
                          <DialogTitle>{name}の3D構造</DialogTitle>
                        </DialogHeader>
                        <div className="flex-grow overflow-hidden h-[90vh]">
                          <MoleculeViewer pubchemId={data.pubchemId} />
                        </div>
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                  <TableCell>
                    <a
                      href={getPubChemLink(data.pubchemId)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-sm text-blue-600 hover:underline"
                    >
                      {data.pubchemId}
                      <ExternalLink className="ml-1 h-3 w-3" />
                    </a>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

export default function Home() {
  return (
    <main className="container mx-auto py-8">
      <FragranceAnalysisApp />
    </main>
  );
}
