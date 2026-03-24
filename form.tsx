import { useState } from 'react';
import { 
  Send, 
  Plus, 
  Edit2, 
  Trash2, 
  Calendar,
  Users,
  CheckCircle,
  Clock,
  AlertCircle,
  Copy,
  Play,
  MoreHorizontal,
  Search,
  Filter,
  X
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useAppStore } from '@/store/appStore';
import type { Campaign, EmailTemplate } from '@/types';

type CampaignStatus = 'draft' | 'scheduled' | 'sending' | 'sent';

interface StatusConfig {
  label: string;
  color: string;
  icon: React.ElementType;
}

const statusConfig: Record<CampaignStatus, StatusConfig> = {
  draft: { label: 'Borrador', color: 'bg-gray-100 text-gray-700', icon: Clock },
  scheduled: { label: 'Programado', color: 'bg-blue-100 text-blue-700', icon: Calendar },
  sending: { label: 'Enviando', color: 'bg-yellow-100 text-yellow-700', icon: Send },
  sent: { label: 'Enviado', color: 'bg-green-100 text-green-700', icon: CheckCircle }
};

export function Campaigns() {
  const { 
    campaigns, 
    templates, 
    contactLists,
    addCampaign, 
    deleteCampaign, 
    duplicateCampaign,
    sendCampaign,
    updateCampaign
  } = useAppStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<CampaignStatus | 'all'>('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isSendDialogOpen, setIsSendDialogOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [newCampaign, setNewCampaign] = useState<Partial<Campaign>>({
    name: '',
    subject: '',
    templateId: '',
    recipientListId: '',
    status: 'draft'
  });

  const filteredCampaigns = campaigns.filter((campaign: Campaign) => {
    const matchesSearch = 
      campaign.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      campaign.subject.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || campaign.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleCreateCampaign = () => {
    if (newCampaign.name && newCampaign.subject && newCampaign.templateId) {
      const selectedList = contactLists.find(l => l.id === newCampaign.recipientListId);
      const campaign: Campaign = {
        id: `camp-${Date.now()}`,
        name: newCampaign.name,
        subject: newCampaign.subject,
        templateId: newCampaign.templateId,
        status: 'draft',
        createdAt: new Date(),
        recipientCount: selectedList?.count || 0
      };
      addCampaign(campaign);
      setIsCreateDialogOpen(false);
      setNewCampaign({ name: '', subject: '', templateId: '', recipientListId: '', status: 'draft' });
    }
  };

  const handleEditCampaign = () => {
    if (selectedCampaign && newCampaign.name && newCampaign.subject) {
      const selectedList = contactLists.find(l => l.id === newCampaign.recipientListId);
      updateCampaign(selectedCampaign.id, {
        name: newCampaign.name,
        subject: newCampaign.subject,
        templateId: newCampaign.templateId,
        recipientCount: selectedList?.count || selectedCampaign.recipientCount
      });
      setIsEditDialogOpen(false);
      setSelectedCampaign(null);
    }
  };

  const handleDeleteCampaign = () => {
    if (selectedCampaign) {
      deleteCampaign(selectedCampaign.id);
      setIsDeleteDialogOpen(false);
      setSelectedCampaign(null);
    }
  };

  const handleSendCampaign = () => {
    if (selectedCampaign) {
      sendCampaign(selectedCampaign.id);
      setIsSendDialogOpen(false);
      setSelectedCampaign(null);
    }
  };

  const openEditDialog = (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    setNewCampaign({
      name: campaign.name,
      subject: campaign.subject,
      templateId: campaign.templateId,
      recipientListId: ''
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    setIsDeleteDialogOpen(true);
  };

  const openSendDialog = (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    setIsSendDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Campañas de Email</h3>
          <p className="text-sm text-gray-500">Gestiona tus campañas de email marketing</p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Nueva Campaña
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Buscar campañas..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as CampaignStatus | 'all')}>
          <SelectTrigger className="w-40">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Filtrar por estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los estados</SelectItem>
            <SelectItem value="draft">Borrador</SelectItem>
            <SelectItem value="scheduled">Programado</SelectItem>
            <SelectItem value="sending">Enviando</SelectItem>
            <SelectItem value="sent">Enviado</SelectItem>
          </SelectContent>
        </Select>
        {statusFilter !== 'all' && (
          <Button variant="ghost" size="sm" onClick={() => setStatusFilter('all')}>
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">Total</p>
            <p className="text-2xl font-bold">{campaigns.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">Borradores</p>
            <p className="text-2xl font-bold">{campaigns.filter(c => c.status === 'draft').length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">Enviando</p>
            <p className="text-2xl font-bold">{campaigns.filter(c => c.status === 'sending').length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">Enviados</p>
            <p className="text-2xl font-bold">{campaigns.filter(c => c.status === 'sent').length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Campaigns List */}
      <div className="grid gap-4">
        {filteredCampaigns.map((campaign: Campaign) => {
          const status = statusConfig[campaign.status as CampaignStatus];
          const StatusIcon = status.icon;
          const template = templates.find((t: EmailTemplate) => t.id === campaign.templateId);

          return (
            <Card key={campaign.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Send className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-3">
                        <h4 className="font-semibold text-gray-900">{campaign.name}</h4>
                        <Badge className={status.color}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {status.label}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">{campaign.subject}</p>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {campaign.createdAt.toLocaleDateString('es-ES')}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {campaign.recipientCount.toLocaleString()} destinatarios
                        </span>
                        <span>Plantilla: {template?.name || 'N/A'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    {campaign.stats && (
                      <div className="flex gap-6">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-gray-900">
                            {campaign.stats.openRate}%
                          </p>
                          <p className="text-xs text-gray-500">Apertura</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-gray-900">
                            {campaign.stats.clickRate}%
                          </p>
                          <p className="text-xs text-gray-500">Clicks</p>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      {campaign.status === 'draft' && (
                        <Button 
                          size="sm" 
                          onClick={() => openSendDialog(campaign)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Play className="w-4 h-4 mr-1" />
                          Enviar
                        </Button>
                      )}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEditDialog(campaign)}>
                            <Edit2 className="w-4 h-4 mr-2" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => duplicateCampaign(campaign.id)}>
                            <Copy className="w-4 h-4 mr-2" />
                            Duplicar
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => openDeleteDialog(campaign)}
                            className="text-red-600"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredCampaigns.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay campañas</h3>
            <p className="text-gray-500 mb-4">
              {searchQuery || statusFilter !== 'all' 
                ? 'No se encontraron campañas con los filtros aplicados' 
                : 'Crea tu primera campaña para empezar'}
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Crear Campaña
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Create Campaign Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Crear Nueva Campaña</DialogTitle>
            <DialogDescription>
              Configura los detalles de tu nueva campaña de email
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre de la Campaña *</Label>
              <Input
                id="name"
                placeholder="Ej: Promoción de Verano"
                value={newCampaign.name}
                onChange={(e) => setNewCampaign({ ...newCampaign, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="subject">Asunto del Correo *</Label>
              <Input
                id="subject"
                placeholder="Ej: 50% de descuento en todos los productos"
                value={newCampaign.subject}
                onChange={(e) => setNewCampaign({ ...newCampaign, subject: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="template">Plantilla *</Label>
              <Select
                value={newCampaign.templateId}
                onValueChange={(value) => setNewCampaign({ ...newCampaign, templateId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona una plantilla" />
                </SelectTrigger>
                <SelectContent>
                  {templates.map((template: EmailTemplate) => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="list">Lista de Destinatarios</Label>
              <Select
                value={newCampaign.recipientListId}
                onValueChange={(value) => setNewCampaign({ ...newCampaign, recipientListId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona una lista" />
                </SelectTrigger>
                <SelectContent>
                  {contactLists.map((list) => (
                    <SelectItem key={list.id} value={list.id}>
                      {list.name} ({list.count} contactos)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button 
              className="w-full" 
              onClick={handleCreateCampaign}
              disabled={!newCampaign.name || !newCampaign.subject || !newCampaign.templateId}
            >
              Crear Campaña
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Campaign Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Editar Campaña</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nombre de la Campaña</Label>
              <Input
                value={newCampaign.name}
                onChange={(e) => setNewCampaign({ ...newCampaign, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Asunto del Correo</Label>
              <Input
                value={newCampaign.subject}
                onChange={(e) => setNewCampaign({ ...newCampaign, subject: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Plantilla</Label>
              <Select
                value={newCampaign.templateId}
                onValueChange={(value) => setNewCampaign({ ...newCampaign, templateId: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {templates.map((template: EmailTemplate) => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button className="w-full" onClick={handleEditCampaign}>
              Guardar Cambios
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar campaña?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. La campaña "{selectedCampaign?.name}" se eliminará permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteCampaign} className="bg-red-600 hover:bg-red-700">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Send Campaign Dialog */}
      <Dialog open={isSendDialogOpen} onOpenChange={setIsSendDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enviar Campaña</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas enviar la campaña "{selectedCampaign?.name}"?
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm"><strong>Asunto:</strong> {selectedCampaign?.subject}</p>
              <p className="text-sm"><strong>Destinatarios:</strong> {selectedCampaign?.recipientCount.toLocaleString()}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={() => setIsSendDialogOpen(false)}>
              Cancelar
            </Button>
            <Button className="flex-1 bg-green-600 hover:bg-green-700" onClick={handleSendCampaign}>
              <Send className="w-4 h-4 mr-2" />
              Confirmar Envío
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
