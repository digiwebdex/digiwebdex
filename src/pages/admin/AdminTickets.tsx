import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
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
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import {
  supportTicketService,
  type SupportTicket,
  type TicketStatus,
  type TicketPriority,
  type TicketCategory,
} from '@/services/support';
import {
  Headphones,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Users,
  MoreVertical,
  Loader2,
  MessageSquare,
  Timer,
  TrendingUp,
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

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

const statusOptions: TicketStatus[] = ['open', 'in_progress', 'waiting_customer', 'resolved', 'closed'];
const priorityOptions: TicketPriority[] = ['low', 'medium', 'high', 'urgent'];
const categoryOptions: TicketCategory[] = ['hosting', 'domain', 'software', 'billing', 'technical', 'other'];

export default function AdminTickets() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');

  const { data: tickets = [], isLoading } = useQuery({
    queryKey: ['admin-tickets', filterStatus, filterPriority],
    queryFn: () =>
      supportTicketService.getAllTickets({
        status: filterStatus !== 'all' ? (filterStatus as TicketStatus) : undefined,
        priority: filterPriority !== 'all' ? (filterPriority as TicketPriority) : undefined,
      }),
  });

  const { data: stats } = useQuery({
    queryKey: ['ticket-stats'],
    queryFn: () => supportTicketService.getTicketStats(),
  });

  const { data: staffMembers = [] } = useQuery({
    queryKey: ['staff-members'],
    queryFn: () => supportTicketService.getStaffMembers(),
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Headphones className="h-6 w-6 text-primary" />
            Support Tickets
          </h1>
          <p className="text-muted-foreground">Manage customer support requests</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <MessageSquare className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-2xl font-bold">{stats?.total || 0}</p>
                  <p className="text-xs text-muted-foreground">Total</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-yellow-500" />
                <div>
                  <p className="text-2xl font-bold">{stats?.open || 0}</p>
                  <p className="text-xs text-muted-foreground">Open</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <TrendingUp className="h-5 w-5 text-purple-500" />
                <div>
                  <p className="text-2xl font-bold">{stats?.inProgress || 0}</p>
                  <p className="text-xs text-muted-foreground">In Progress</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-2xl font-bold">{stats?.resolved || 0}</p>
                  <p className="text-xs text-muted-foreground">Resolved</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                <div>
                  <p className="text-2xl font-bold">{stats?.slaBreach || 0}</p>
                  <p className="text-xs text-muted-foreground">SLA Breach</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Timer className="h-5 w-5 text-indigo-500" />
                <div>
                  <p className="text-2xl font-bold">{stats?.avgResponseTime?.toFixed(1) || 0}h</p>
                  <p className="text-xs text-muted-foreground">Avg Response</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4">
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {statusOptions.map((s) => (
                <SelectItem key={s} value={s}>
                  {s.replace('_', ' ')}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterPriority} onValueChange={setFilterPriority}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priorities</SelectItem>
              {priorityOptions.map((p) => (
                <SelectItem key={p} value={p}>
                  {p}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Tickets Table */}
        <Card>
          <CardHeader>
            <CardTitle>Tickets</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : tickets.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No tickets found
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b text-left text-sm text-muted-foreground">
                      <th className="pb-3 font-medium">Ticket</th>
                      <th className="pb-3 font-medium">Customer</th>
                      <th className="pb-3 font-medium">Category</th>
                      <th className="pb-3 font-medium">Priority</th>
                      <th className="pb-3 font-medium">Status</th>
                      <th className="pb-3 font-medium">Assigned</th>
                      <th className="pb-3 font-medium">Created</th>
                      <th className="pb-3 font-medium">SLA</th>
                      <th className="pb-3 font-medium"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {tickets.map((ticket) => {
                      const slaBreach = ticket.sla_due_at && 
                        new Date(ticket.sla_due_at) < new Date() && 
                        !['resolved', 'closed'].includes(ticket.status);
                      
                      return (
                        <tr 
                          key={ticket.id} 
                          className="border-b hover:bg-muted/50 cursor-pointer"
                          onClick={() => setSelectedTicket(ticket)}
                        >
                          <td className="py-3">
                            <div>
                              <span className="text-xs font-mono text-muted-foreground">
                                {ticket.ticket_number}
                              </span>
                              <p className="font-medium truncate max-w-[200px]">{ticket.subject}</p>
                            </div>
                          </td>
                          <td className="py-3 text-sm">{ticket.user_name}</td>
                          <td className="py-3">
                            <Badge variant="outline">{ticket.category}</Badge>
                          </td>
                          <td className="py-3">
                            <Badge className={cn('text-white', priorityColors[ticket.priority])}>
                              {ticket.priority}
                            </Badge>
                          </td>
                          <td className="py-3">
                            <Badge className={cn('text-white', statusColors[ticket.status])}>
                              {ticket.status.replace('_', ' ')}
                            </Badge>
                          </td>
                          <td className="py-3 text-sm">
                            {ticket.assigned_name || (
                              <span className="text-muted-foreground">Unassigned</span>
                            )}
                          </td>
                          <td className="py-3 text-sm text-muted-foreground">
                            {format(new Date(ticket.created_at), 'MMM dd, HH:mm')}
                          </td>
                          <td className="py-3">
                            {slaBreach ? (
                              <Badge variant="destructive" className="gap-1">
                                <AlertTriangle className="h-3 w-3" />
                                Breached
                              </Badge>
                            ) : ticket.sla_due_at ? (
                              <span className="text-xs text-muted-foreground">
                                {format(new Date(ticket.sla_due_at), 'MMM dd, HH:mm')}
                              </span>
                            ) : null}
                          </td>
                          <td className="py-3">
                            <TicketActions 
                              ticket={ticket} 
                              staffMembers={staffMembers}
                              onUpdate={() => {
                                queryClient.invalidateQueries({ queryKey: ['admin-tickets'] });
                                queryClient.invalidateQueries({ queryKey: ['ticket-stats'] });
                              }}
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Ticket Detail Modal */}
        {selectedTicket && (
          <AdminTicketModal
            ticket={selectedTicket}
            staffMembers={staffMembers}
            onClose={() => setSelectedTicket(null)}
          />
        )}
      </div>
    </AdminLayout>
  );
}

// Ticket Actions Dropdown
function TicketActions({
  ticket,
  staffMembers,
  onUpdate,
}: {
  ticket: SupportTicket;
  staffMembers: { id: string; full_name: string }[];
  onUpdate: () => void;
}) {
  const { toast } = useToast();

  const updateStatus = async (status: TicketStatus) => {
    try {
      await supportTicketService.updateStatus(ticket.id, status);
      toast({ title: `Status updated to ${status}` });
      onUpdate();
    } catch (err) {
      toast({ title: 'Failed to update status', variant: 'destructive' });
    }
  };

  const assignTo = async (staffId: string | null) => {
    try {
      await supportTicketService.assignTicket(ticket.id, staffId);
      toast({ title: staffId ? 'Ticket assigned' : 'Assignment removed' });
      onUpdate();
    } catch (err) {
      toast({ title: 'Failed to assign ticket', variant: 'destructive' });
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
        <Button variant="ghost" size="icon">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
        <DropdownMenuItem className="font-medium text-muted-foreground" disabled>
          Change Status
        </DropdownMenuItem>
        {statusOptions.map((s) => (
          <DropdownMenuItem key={s} onClick={() => updateStatus(s)}>
            {s.replace('_', ' ')}
          </DropdownMenuItem>
        ))}
        <DropdownMenuItem className="font-medium text-muted-foreground mt-2" disabled>
          Assign To
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => assignTo(null)}>Unassign</DropdownMenuItem>
        {staffMembers.map((staff) => (
          <DropdownMenuItem key={staff.id} onClick={() => assignTo(staff.id)}>
            {staff.full_name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Admin Ticket Detail Modal
function AdminTicketModal({
  ticket,
  staffMembers,
  onClose,
}: {
  ticket: SupportTicket;
  staffMembers: { id: string; full_name: string }[];
  onClose: () => void;
}) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [message, setMessage] = useState('');
  const [isInternalNote, setIsInternalNote] = useState(false);

  const { data: messages = [], isLoading } = useQuery({
    queryKey: ['ticket-messages', ticket.id],
    queryFn: () => supportTicketService.getTicketMessages(ticket.id),
  });

  const sendMutation = useMutation({
    mutationFn: (data: { msg: string; internal: boolean }) =>
      supportTicketService.addMessage(ticket.id, data.msg, data.internal),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ticket-messages', ticket.id] });
      queryClient.invalidateQueries({ queryKey: ['admin-tickets'] });
      setMessage('');
      toast({ title: 'Message sent' });
    },
    onError: (error) => {
      toast({ title: 'Failed to send', description: String(error), variant: 'destructive' });
    },
  });

  const handleSend = () => {
    if (!message.trim()) return;
    sendMutation.mutate({ msg: message, internal: isInternalNote });
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <span className="text-sm font-mono text-muted-foreground">{ticket.ticket_number}</span>
            <Badge className={cn('text-white', statusColors[ticket.status])}>
              {ticket.status.replace('_', ' ')}
            </Badge>
            <Badge className={cn('text-white', priorityColors[ticket.priority])}>
              {ticket.priority}
            </Badge>
          </div>
          <DialogTitle className="text-xl">{ticket.subject}</DialogTitle>
          <div className="flex gap-4 text-sm text-muted-foreground">
            <span>Customer: {ticket.user_name}</span>
            <span>Category: {ticket.category}</span>
            <span>Assigned: {ticket.assigned_name || 'Unassigned'}</span>
          </div>
        </DialogHeader>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto space-y-4 py-4 min-h-[300px]">
          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground mb-1">
              {format(new Date(ticket.created_at), 'MMM dd, yyyy HH:mm')} - Initial Request
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
                  'p-4 rounded-lg',
                  msg.is_internal_note
                    ? 'bg-yellow-100 dark:bg-yellow-900/20 border border-yellow-300'
                    : msg.sender_id === ticket.user_id
                    ? 'bg-muted'
                    : 'bg-primary/10 ml-8'
                )}
              >
                <div className="flex justify-between items-center mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{msg.sender_name}</span>
                    {msg.is_internal_note && (
                      <Badge variant="outline" className="text-xs">Internal Note</Badge>
                    )}
                  </div>
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
        <div className="border-t pt-4 space-y-3">
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your reply..."
            rows={3}
          />
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Checkbox
                id="internal-note"
                checked={isInternalNote}
                onCheckedChange={(c) => setIsInternalNote(c === true)}
              />
              <Label htmlFor="internal-note" className="text-sm">
                Internal note (not visible to customer)
              </Label>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
              <Button onClick={handleSend} disabled={sendMutation.isPending || !message.trim()}>
                {sendMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {isInternalNote ? 'Add Note' : 'Send Reply'}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
