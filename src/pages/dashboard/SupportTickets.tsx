import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/lib/i18n';
import { 
  supportTicketService, 
  type SupportTicket, 
  type TicketCategory,
  type TicketPriority 
} from '@/services/support';
import { 
  Plus, 
  MessageSquare, 
  Clock, 
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Headphones
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

const categoryOptions: { value: TicketCategory; label: string }[] = [
  { value: 'hosting', label: 'Hosting' },
  { value: 'domain', label: 'Domain' },
  { value: 'software', label: 'Software' },
  { value: 'billing', label: 'Billing' },
  { value: 'technical', label: 'Technical Support' },
  { value: 'other', label: 'Other' },
];

const priorityOptions: { value: TicketPriority; label: string }[] = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' },
];

const statusColors: Record<string, string> = {
  open: 'bg-blue-500',
  in_progress: 'bg-yellow-500',
  waiting_customer: 'bg-purple-500',
  resolved: 'bg-green-500',
  closed: 'bg-gray-500',
};

const priorityColors: Record<string, string> = {
  low: 'bg-gray-400',
  medium: 'bg-blue-400',
  high: 'bg-orange-500',
  urgent: 'bg-red-500',
};

export default function SupportTickets() {
  const { language } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  
  // Form state
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<TicketCategory>('other');
  const [priority, setPriority] = useState<TicketPriority>('medium');

  const { data: tickets = [], isLoading } = useQuery({
    queryKey: ['user-tickets'],
    queryFn: () => supportTicketService.getUserTickets(),
  });

  const createMutation = useMutation({
    mutationFn: supportTicketService.createTicket,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-tickets'] });
      toast({ title: 'Ticket created successfully' });
      setIsCreateOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast({ title: 'Failed to create ticket', description: String(error), variant: 'destructive' });
    },
  });

  const resetForm = () => {
    setSubject('');
    setDescription('');
    setCategory('other');
    setPriority('medium');
  };

  const handleCreate = () => {
    if (!subject.trim()) {
      toast({ title: 'Subject is required', variant: 'destructive' });
      return;
    }
    createMutation.mutate({ subject, description, category, priority });
  };

  const openTickets = tickets.filter(t => t.status === 'open' || t.status === 'in_progress');
  const resolvedTickets = tickets.filter(t => t.status === 'resolved' || t.status === 'closed');

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Headphones className="h-6 w-6 text-primary" />
              {language === 'bn' ? 'সাপোর্ট টিকেট' : 'Support Tickets'}
            </h1>
            <p className="text-muted-foreground">
              {language === 'bn' ? 'আপনার সাপোর্ট অনুরোধ পরিচালনা করুন' : 'Manage your support requests'}
            </p>
          </div>
          
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                {language === 'bn' ? 'নতুন টিকেট' : 'New Ticket'}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>
                  {language === 'bn' ? 'নতুন সাপোর্ট টিকেট তৈরি করুন' : 'Create New Support Ticket'}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <Label>{language === 'bn' ? 'বিষয়' : 'Subject'} *</Label>
                  <Input
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder={language === 'bn' ? 'আপনার সমস্যার সংক্ষিপ্ত বিবরণ' : 'Brief description of your issue'}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>{language === 'bn' ? 'বিভাগ' : 'Category'}</Label>
                    <Select value={category} onValueChange={(v) => setCategory(v as TicketCategory)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {categoryOptions.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>{language === 'bn' ? 'অগ্রাধিকার' : 'Priority'}</Label>
                    <Select value={priority} onValueChange={(v) => setPriority(v as TicketPriority)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {priorityOptions.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label>{language === 'bn' ? 'বিস্তারিত' : 'Description'}</Label>
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder={language === 'bn' ? 'আপনার সমস্যার বিস্তারিত বিবরণ দিন...' : 'Provide detailed description of your issue...'}
                    rows={5}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                    {language === 'bn' ? 'বাতিল' : 'Cancel'}
                  </Button>
                  <Button onClick={handleCreate} disabled={createMutation.isPending}>
                    {createMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    {language === 'bn' ? 'জমা দিন' : 'Submit'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <MessageSquare className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{tickets.length}</p>
                  <p className="text-xs text-muted-foreground">
                    {language === 'bn' ? 'মোট টিকেট' : 'Total Tickets'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-yellow-500/10">
                  <Clock className="h-5 w-5 text-yellow-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{openTickets.length}</p>
                  <p className="text-xs text-muted-foreground">
                    {language === 'bn' ? 'চলমান' : 'Open'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-500/10">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{resolvedTickets.length}</p>
                  <p className="text-xs text-muted-foreground">
                    {language === 'bn' ? 'সমাধান' : 'Resolved'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-red-500/10">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {tickets.filter(t => t.priority === 'urgent' && t.status !== 'closed').length}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {language === 'bn' ? 'জরুরি' : 'Urgent'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Ticket List */}
        <Card>
          <CardHeader>
            <CardTitle>{language === 'bn' ? 'আপনার টিকেট' : 'Your Tickets'}</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : tickets.length === 0 ? (
              <div className="text-center py-12">
                <Headphones className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">
                  {language === 'bn' ? 'কোনো টিকেট নেই' : 'No tickets yet'}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {language === 'bn' 
                    ? 'সাহায্যের জন্য একটি নতুন টিকেট তৈরি করুন' 
                    : 'Create a new ticket to get help'}
                </p>
                <Button onClick={() => setIsCreateOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  {language === 'bn' ? 'টিকেট তৈরি করুন' : 'Create Ticket'}
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {tickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    onClick={() => setSelectedTicket(ticket)}
                    className="p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                  >
                    <div className="flex flex-col sm:flex-row justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs text-muted-foreground font-mono">
                            {ticket.ticket_number}
                          </span>
                          <Badge className={cn('text-xs text-white', statusColors[ticket.status])}>
                            {ticket.status.replace('_', ' ')}
                          </Badge>
                          <Badge 
                            variant="outline" 
                            className={cn('text-xs', priorityColors[ticket.priority], 'text-white border-0')}
                          >
                            {ticket.priority}
                          </Badge>
                        </div>
                        <h4 className="font-medium">{ticket.subject}</h4>
                        <p className="text-sm text-muted-foreground line-clamp-1">
                          {ticket.description || 'No description provided'}
                        </p>
                      </div>
                      <div className="text-right text-sm text-muted-foreground">
                        <p>{format(new Date(ticket.created_at), 'MMM dd, yyyy')}</p>
                        <p className="text-xs">{format(new Date(ticket.created_at), 'HH:mm')}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Ticket Detail Modal */}
        {selectedTicket && (
          <TicketDetailModal 
            ticket={selectedTicket} 
            onClose={() => setSelectedTicket(null)} 
          />
        )}
      </div>
    </DashboardLayout>
  );
}

// Ticket Detail Modal Component
function TicketDetailModal({ ticket, onClose }: { ticket: SupportTicket; onClose: () => void }) {
  const { language } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [message, setMessage] = useState('');

  const { data: messages = [], isLoading } = useQuery({
    queryKey: ['ticket-messages', ticket.id],
    queryFn: () => supportTicketService.getTicketMessages(ticket.id),
  });

  const sendMutation = useMutation({
    mutationFn: (msg: string) => supportTicketService.addMessage(ticket.id, msg),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ticket-messages', ticket.id] });
      queryClient.invalidateQueries({ queryKey: ['user-tickets'] });
      setMessage('');
      toast({ title: 'Message sent' });
    },
    onError: (error) => {
      toast({ title: 'Failed to send message', description: String(error), variant: 'destructive' });
    },
  });

  const handleSend = () => {
    if (!message.trim()) return;
    sendMutation.mutate(message);
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="text-sm font-mono text-muted-foreground">{ticket.ticket_number}</span>
            <Badge className={cn('text-white', statusColors[ticket.status])}>
              {ticket.status.replace('_', ' ')}
            </Badge>
          </DialogTitle>
          <h3 className="font-semibold text-lg">{ticket.subject}</h3>
        </DialogHeader>
        
        {/* Messages */}
        <div className="flex-1 overflow-y-auto space-y-4 py-4 min-h-[300px]">
          {/* Initial description */}
          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground mb-1">
              {format(new Date(ticket.created_at), 'MMM dd, yyyy HH:mm')}
            </p>
            <p>{ticket.description || 'No description provided'}</p>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  'p-4 rounded-lg max-w-[80%]',
                  msg.sender_id === ticket.user_id 
                    ? 'bg-primary/10 ml-auto' 
                    : 'bg-muted'
                )}
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium">{msg.sender_name}</span>
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(msg.created_at), 'MMM dd, HH:mm')}
                  </span>
                </div>
                <p className="text-sm">{msg.message}</p>
              </div>
            ))
          )}
        </div>

        {/* Reply Box */}
        {ticket.status !== 'closed' && (
          <div className="border-t pt-4 space-y-3">
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={language === 'bn' ? 'আপনার বার্তা লিখুন...' : 'Type your message...'}
              rows={3}
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={onClose}>
                {language === 'bn' ? 'বন্ধ করুন' : 'Close'}
              </Button>
              <Button onClick={handleSend} disabled={sendMutation.isPending || !message.trim()}>
                {sendMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {language === 'bn' ? 'পাঠান' : 'Send'}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
