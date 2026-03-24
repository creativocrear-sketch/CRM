import { useState } from 'react';
import { 
  Type, 
  Image, 
  Square, 
  Minus, 
  LayoutGrid,
  MousePointer,
  Save,
  Eye,
  ArrowLeft,
  Trash2,
  Settings,
  Palette
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAppStore } from '@/store/appStore';
import type { EmailBlock, BlockStyles, BlockSettings } from '@/types';

const blockTypes = [
  { type: 'header', label: 'Encabezado', icon: Type },
  { type: 'text', label: 'Texto', icon: Type },
  { type: 'image', label: 'Imagen', icon: Image },
  { type: 'button', label: 'Botón', icon: MousePointer },
  { type: 'divider', label: 'Divisor', icon: Minus },
  { type: 'spacer', label: 'Espaciador', icon: Square },
  { type: 'columns', label: 'Columnas', icon: LayoutGrid },
  { type: 'footer', label: 'Pie de página', icon: LayoutGrid },
];

const defaultStyles: BlockStyles = {
  backgroundColor: '#ffffff',
  textColor: '#333333',
  fontSize: '16px',
  fontFamily: 'Arial, sans-serif',
  padding: '20px',
  textAlign: 'left',
  borderRadius: '0px'
};

export function EmailBuilder() {
  const { setCurrentView, addTemplate } = useAppStore();
  const [blocks, setBlocks] = useState<EmailBlock[]>([]);
  const [selectedBlock, setSelectedBlock] = useState<EmailBlock | null>(null);
  const [templateName, setTemplateName] = useState('Nueva Plantilla');
  const [draggedType, setDraggedType] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const handleDragStart = (type: string) => {
    setDraggedType(type);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, index?: number) => {
    e.preventDefault();
    if (!draggedType) return;

    const newBlock: EmailBlock = {
      id: `block-${Date.now()}`,
      type: draggedType as EmailBlock['type'],
      content: getDefaultContent(draggedType),
      styles: { ...defaultStyles },
      settings: getDefaultSettings(draggedType)
    };

    if (index !== undefined) {
      const newBlocks = [...blocks];
      newBlocks.splice(index, 0, newBlock);
      setBlocks(newBlocks);
    } else {
      setBlocks([...blocks, newBlock]);
    }
    setDraggedType(null);
  };

  const getDefaultContent = (type: string): string => {
    switch (type) {
      case 'header':
        return '<h1>Título Principal</h1>';
      case 'text':
        return '<p>Escribe tu texto aquí...</p>';
      case 'button':
        return 'Click aquí';
      case 'footer':
        return '© 2026 Tu Empresa. Todos los derechos reservados.';
      default:
        return '';
    }
  };

  const getDefaultSettings = (type: string): BlockSettings => {
    switch (type) {
      case 'button':
        return {
          buttonText: 'Click aquí',
          buttonColor: '#3B82F6',
          buttonTextColor: '#FFFFFF',
          href: '#'
        };
      case 'image':
        return {
          src: 'https://via.placeholder.com/600x300',
          alt: 'Imagen'
        };
      case 'spacer':
        return { height: 40 };
      default:
        return {};
    }
  };

  const updateBlock = (id: string, updates: Partial<EmailBlock>) => {
    setBlocks(blocks.map(b => b.id === id ? { ...b, ...updates } : b));
    if (selectedBlock?.id === id) {
      setSelectedBlock({ ...selectedBlock, ...updates });
    }
  };

  const deleteBlock = (id: string) => {
    setBlocks(blocks.filter(b => b.id !== id));
    if (selectedBlock?.id === id) {
      setSelectedBlock(null);
    }
  };

  const saveTemplate = () => {
    const template = {
      id: `template-${Date.now()}`,
      name: templateName,
      content: blocks,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    addTemplate(template);
    setCurrentView('templates');
  };

  const moveBlock = (fromIndex: number, toIndex: number) => {
    const newBlocks = [...blocks];
    const [movedBlock] = newBlocks.splice(fromIndex, 1);
    newBlocks.splice(toIndex, 0, movedBlock);
    setBlocks(newBlocks);
  };

  if (showPreview) {
    return (
      <div className="h-full">
        <div className="flex items-center justify-between mb-6">
          <Button variant="outline" onClick={() => setShowPreview(false)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver al Editor
          </Button>
          <h3 className="text-lg font-semibold">Vista Previa</h3>
        </div>
        <div className="bg-gray-100 p-8 rounded-lg">
          <div 
            className="max-w-2xl mx-auto bg-white shadow-lg"
            style={{ minHeight: '600px' }}
          >
            {blocks.map((block) => (
              <BlockRenderer key={block.id} block={block} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => setCurrentView('templates')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
          <Input
            value={templateName}
            onChange={(e) => setTemplateName(e.target.value)}
            className="w-64 font-semibold"
          />
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setShowPreview(true)}>
            <Eye className="w-4 h-4 mr-2" />
            Vista Previa
          </Button>
          <Button onClick={saveTemplate}>
            <Save className="w-4 h-4 mr-2" />
            Guardar Plantilla
          </Button>
        </div>
      </div>

      <div className="flex-1 flex gap-6 overflow-hidden">
        {/* Sidebar - Bloques */}
        <Card className="w-64 flex flex-col">
          <div className="p-4 border-b">
            <h4 className="font-semibold flex items-center gap-2">
              <LayoutGrid className="w-4 h-4" />
              Bloques
            </h4>
            <p className="text-xs text-gray-500 mt-1">Arrastra los bloques al canvas</p>
          </div>
          <div className="flex-1 p-4 overflow-auto">
            <div className="grid grid-cols-2 gap-2">
              {blockTypes.map((block) => {
                const Icon = block.icon;
                return (
                  <div
                    key={block.type}
                    draggable
                    onDragStart={() => handleDragStart(block.type)}
                    className="flex flex-col items-center p-3 bg-gray-50 rounded-lg cursor-move hover:bg-gray-100 transition-colors"
                  >
                    <Icon className="w-6 h-6 text-gray-600 mb-2" />
                    <span className="text-xs text-gray-700">{block.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </Card>

        {/* Canvas */}
        <div className="flex-1 flex gap-6">
          <Card 
            className="flex-1 overflow-auto"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e)}
          >
            <div className="p-8 min-h-full">
              <div 
                className="max-w-2xl mx-auto bg-white shadow-lg min-h-[600px]"
                style={{ minHeight: '600px' }}
              >
                {blocks.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-gray-400 p-12">
                    <LayoutGrid className="w-16 h-16 mb-4" />
                    <p className="text-lg font-medium">Arrastra bloques aquí</p>
                    <p className="text-sm">Comienza a construir tu correo</p>
                  </div>
                ) : (
                  blocks.map((block, index) => (
                    <div
                      key={block.id}
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.setData('blockIndex', index.toString());
                      }}
                      onDragOver={handleDragOver}
                      onDrop={(e) => {
                        const fromIndex = parseInt(e.dataTransfer.getData('blockIndex'));
                        if (!isNaN(fromIndex)) {
                          moveBlock(fromIndex, index);
                        }
                      }}
                      onClick={() => setSelectedBlock(block)}
                      className={`relative group cursor-pointer border-2 border-transparent hover:border-blue-300 ${
                        selectedBlock?.id === block.id ? 'border-blue-500' : ''
                      }`}
                    >
                      <BlockRenderer block={block} />
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 flex gap-1">
                        <Button
                          variant="destructive"
                          size="icon"
                          className="w-6 h-6"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteBlock(block.id);
                          }}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </Card>

          {/* Properties Panel */}
          <Card className="w-80 flex flex-col">
            <div className="p-4 border-b">
              <h4 className="font-semibold flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Propiedades
              </h4>
            </div>
            <div className="flex-1 p-4 overflow-auto">
              {selectedBlock ? (
                <BlockProperties 
                  block={selectedBlock} 
                  onUpdate={(updates) => updateBlock(selectedBlock.id, updates)}
                />
              ) : (
                <div className="text-center text-gray-400 py-12">
                  <Palette className="w-12 h-12 mx-auto mb-4" />
                  <p>Selecciona un bloque para editar sus propiedades</p>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function BlockRenderer({ block }: { block: EmailBlock }) {
  const styles: React.CSSProperties = {
    backgroundColor: block.styles?.backgroundColor,
    color: block.styles?.textColor,
    fontSize: block.styles?.fontSize,
    fontFamily: block.styles?.fontFamily,
    padding: block.styles?.padding,
    textAlign: block.styles?.textAlign,
    borderRadius: block.styles?.borderRadius
  };

  switch (block.type) {
    case 'header':
      return (
        <div style={styles} dangerouslySetInnerHTML={{ __html: block.content || '' }} />
      );
    case 'text':
      return (
        <div style={styles} dangerouslySetInnerHTML={{ __html: block.content || '' }} />
      );
    case 'image':
      return (
        <div style={styles}>
          <img 
            src={block.settings?.src} 
            alt={block.settings?.alt}
            className="w-full h-auto"
          />
        </div>
      );
    case 'button':
      return (
        <div style={{ ...styles, textAlign: 'center' }}>
          <a
            href={block.settings?.href}
            style={{
              backgroundColor: block.settings?.buttonColor,
              color: block.settings?.buttonTextColor,
              padding: '12px 32px',
              borderRadius: '6px',
              textDecoration: 'none',
              display: 'inline-block',
              fontWeight: 'bold'
            }}
          >
            {block.settings?.buttonText}
          </a>
        </div>
      );
    case 'divider':
      return (
        <div style={styles}>
          <hr style={{ border: 'none', borderTop: '1px solid #e5e7eb' }} />
        </div>
      );
    case 'spacer':
      return (
        <div style={{ height: block.settings?.height || 40 }} />
      );
    case 'footer':
      return (
        <div style={{ ...styles, backgroundColor: '#f3f4f6', textAlign: 'center' }}>
          <p>{block.content}</p>
          <div className="mt-2">
            <a href="#" className="text-blue-600 text-sm">Darme de baja</a>
            <span className="mx-2 text-gray-400">|</span>
            <a href="#" className="text-blue-600 text-sm">Gestionar preferencias</a>
          </div>
        </div>
      );
    case 'columns':
      return (
        <div style={{ ...styles, display: 'flex', gap: '20px' }}>
          <div className="flex-1">Columna 1</div>
          <div className="flex-1">Columna 2</div>
        </div>
      );
    default:
      return null;
  }
}

function BlockProperties({ block, onUpdate }: { block: EmailBlock; onUpdate: (updates: Partial<EmailBlock>) => void }) {
  return (
    <div className="space-y-4">
      <div>
        <Label className="text-xs font-semibold uppercase text-gray-500">Tipo</Label>
        <p className="text-sm font-medium capitalize">{block.type}</p>
      </div>

      {(block.type === 'header' || block.type === 'text' || block.type === 'footer') && (
        <div>
          <Label>Contenido</Label>
          <textarea
            value={block.content}
            onChange={(e) => onUpdate({ content: e.target.value })}
            className="w-full mt-1 p-2 border rounded-md text-sm"
            rows={4}
          />
        </div>
      )}

      {block.type === 'image' && (
        <>
          <div>
            <Label>URL de la Imagen</Label>
            <Input
              value={block.settings?.src || ''}
              onChange={(e) => onUpdate({ 
                settings: { ...block.settings, src: e.target.value }
              })}
              className="mt-1"
            />
          </div>
          <div>
            <Label>Texto Alternativo</Label>
            <Input
              value={block.settings?.alt || ''}
              onChange={(e) => onUpdate({ 
                settings: { ...block.settings, alt: e.target.value }
              })}
              className="mt-1"
            />
          </div>
        </>
      )}

      {block.type === 'button' && (
        <>
          <div>
            <Label>Texto del Botón</Label>
            <Input
              value={block.settings?.buttonText || ''}
              onChange={(e) => onUpdate({ 
                settings: { ...block.settings, buttonText: e.target.value }
              })}
              className="mt-1"
            />
          </div>
          <div>
            <Label>URL</Label>
            <Input
              value={block.settings?.href || ''}
              onChange={(e) => onUpdate({ 
                settings: { ...block.settings, href: e.target.value }
              })}
              className="mt-1"
            />
          </div>
          <div>
            <Label>Color del Botón</Label>
            <div className="flex gap-2 mt-1">
              <input
                type="color"
                value={block.settings?.buttonColor || '#3B82F6'}
                onChange={(e) => onUpdate({ 
                  settings: { ...block.settings, buttonColor: e.target.value }
                })}
                className="w-10 h-10 rounded cursor-pointer"
              />
              <Input
                value={block.settings?.buttonColor || '#3B82F6'}
                onChange={(e) => onUpdate({ 
                  settings: { ...block.settings, buttonColor: e.target.value }
                })}
                className="flex-1"
              />
            </div>
          </div>
        </>
      )}

      {block.type === 'spacer' && (
        <div>
          <Label>Altura (px)</Label>
          <Input
            type="number"
            value={block.settings?.height || 40}
            onChange={(e) => onUpdate({ 
              settings: { ...block.settings, height: parseInt(e.target.value) }
            })}
            className="mt-1"
          />
        </div>
      )}

      <Tabs defaultValue="style">
        <TabsList className="w-full">
          <TabsTrigger value="style" className="flex-1">Estilo</TabsTrigger>
          <TabsTrigger value="layout" className="flex-1">Diseño</TabsTrigger>
        </TabsList>
        
        <TabsContent value="style" className="space-y-4">
          <div>
            <Label>Color de Fondo</Label>
            <div className="flex gap-2 mt-1">
              <input
                type="color"
                value={block.styles?.backgroundColor || '#ffffff'}
                onChange={(e) => onUpdate({ 
                  styles: { ...block.styles, backgroundColor: e.target.value }
                })}
                className="w-10 h-10 rounded cursor-pointer"
              />
              <Input
                value={block.styles?.backgroundColor || '#ffffff'}
                onChange={(e) => onUpdate({ 
                  styles: { ...block.styles, backgroundColor: e.target.value }
                })}
                className="flex-1"
              />
            </div>
          </div>

          <div>
            <Label>Color de Texto</Label>
            <div className="flex gap-2 mt-1">
              <input
                type="color"
                value={block.styles?.textColor || '#333333'}
                onChange={(e) => onUpdate({ 
                  styles: { ...block.styles, textColor: e.target.value }
                })}
                className="w-10 h-10 rounded cursor-pointer"
              />
              <Input
                value={block.styles?.textColor || '#333333'}
                onChange={(e) => onUpdate({ 
                  styles: { ...block.styles, textColor: e.target.value }
                })}
                className="flex-1"
              />
            </div>
          </div>

          <div>
            <Label>Tamaño de Fuente</Label>
            <Select
              value={block.styles?.fontSize}
              onValueChange={(value) => onUpdate({ 
                styles: { ...block.styles, fontSize: value }
              })}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="12px">12px</SelectItem>
                <SelectItem value="14px">14px</SelectItem>
                <SelectItem value="16px">16px</SelectItem>
                <SelectItem value="18px">18px</SelectItem>
                <SelectItem value="20px">20px</SelectItem>
                <SelectItem value="24px">24px</SelectItem>
                <SelectItem value="32px">32px</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </TabsContent>

        <TabsContent value="layout" className="space-y-4">
          <div>
            <Label>Alineación</Label>
            <div className="flex gap-2 mt-1">
              {['left', 'center', 'right'].map((align) => (
                <Button
                  key={align}
                  variant={block.styles?.textAlign === align ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => onUpdate({ 
                    styles: { ...block.styles, textAlign: align as any }
                  })}
                  className="flex-1"
                >
                  {align === 'left' && '←'}
                  {align === 'center' && '↔'}
                  {align === 'right' && '→'}
                </Button>
              ))}
            </div>
          </div>

          <div>
            <Label>Padding</Label>
            <Select
              value={block.styles?.padding}
              onValueChange={(value) => onUpdate({ 
                styles: { ...block.styles, padding: value }
              })}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0px">Ninguno</SelectItem>
                <SelectItem value="10px">Pequeño</SelectItem>
                <SelectItem value="20px">Medio</SelectItem>
                <SelectItem value="40px">Grande</SelectItem>
                <SelectItem value="60px">Extra Grande</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
