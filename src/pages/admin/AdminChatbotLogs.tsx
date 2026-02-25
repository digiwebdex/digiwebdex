import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { useLanguage } from '@/lib/i18n';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MessageSquare, Search, RefreshCcw, User, Bot } from 'lucide-react';
import { format } from 'date-fns';

export default function AdminChatbotLogs() {
  const { language } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSender, setSelectedSender] = useState<string | null>(null);

  const { data: conversations, isLoading, refetch } = useQuery({
    queryKey: ['chatbot-conversations', searchQuery],
    queryFn: async () => {
      let query = supabase
        .from('chatbot_conversations' as any)
        .select('*')
        .order('created_at', { ascending: false })
        .limit(200);

      if (searchQuery) {
        query = query.or(`message_in.ilike.%${searchQuery}%,message_out.ilike.%${searchQuery}%,sender_id.ilike.%${searchQuery}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as any[];
    },
  });

  // Get unique senders with message counts
  const senderStats = conversations?.reduce((acc: Record<string, { count: number; lastMessage: string }>, conv: any) => {
    if (!acc[conv.sender_id]) {
      acc[conv.sender_id] = { count: 0, lastMessage: conv.created_at };
    }
    acc[conv.sender_id].count++;
    return acc;
  }, {}) || {};

  const filteredConversations = selectedSender
    ? conversations?.filter((c: any) => c.sender_id === selectedSender)
    : conversations;

  const uniqueSenders = Object.keys(senderStats);

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">
              {language === 'bn' ? 'মেসেঞ্জার চ্যাটবট লগ' : 'Messenger Chatbot Logs'}
            </h1>
            <p className="text-muted-foreground">
              {language === 'bn'
                ? 'ফেসবুক মেসেঞ্জারে AI চ্যাটবটের সকল কনভার্সেশন'
                : 'All AI chatbot conversations from Facebook Messenger'}
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCcw className="h-4 w-4 mr-2" />
            {language === 'bn' ? 'রিফ্রেশ' : 'Refresh'}
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {language === 'bn' ? 'মোট কনভার্সেশন' : 'Total Messages'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{conversations?.length || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {language === 'bn' ? 'ইউনিক ব্যবহারকারী' : 'Unique Users'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{uniqueSenders.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {language === 'bn' ? 'প্ল্যাটফর্ম' : 'Platform'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Badge variant="secondary">
                <MessageSquare className="h-3 w-3 mr-1" />
                Messenger
              </Badge>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={language === 'bn' ? 'মেসেজ বা সেন্ডার ID দিয়ে খুঁজুন...' : 'Search by message or sender ID...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Sender filter chips */}
        {uniqueSenders.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedSender === null ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedSender(null)}
            >
              {language === 'bn' ? 'সবগুলো' : 'All'} ({conversations?.length})
            </Button>
            {uniqueSenders.slice(0, 10).map((senderId) => (
              <Button
                key={senderId}
                variant={selectedSender === senderId ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedSender(senderId === selectedSender ? null : senderId)}
              >
                <User className="h-3 w-3 mr-1" />
                {senderId.slice(-6)} ({senderStats[senderId].count})
              </Button>
            ))}
          </div>
        )}

        {/* Conversation list */}
        <div className="space-y-3">
          {isLoading ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                {language === 'bn' ? 'লোড হচ্ছে...' : 'Loading...'}
              </CardContent>
            </Card>
          ) : !filteredConversations?.length ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                {language === 'bn' ? 'কোনো কনভার্সেশন নেই' : 'No conversations found'}
              </CardContent>
            </Card>
          ) : (
            filteredConversations.map((conv: any) => (
              <Card key={conv.id} className="overflow-hidden">
                <CardContent className="p-4 space-y-3">
                  {/* Header */}
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        <User className="h-3 w-3 mr-1" />
                        {conv.sender_id.slice(-8)}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">{conv.platform}</Badge>
                    </div>
                    <span>{format(new Date(conv.created_at), 'dd MMM yyyy, hh:mm a')}</span>
                  </div>

                  {/* User message */}
                  <div className="flex gap-2">
                    <div className="shrink-0 h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="h-4 w-4 text-primary" />
                    </div>
                    <div className="bg-muted rounded-lg px-3 py-2 text-sm flex-1">
                      {conv.message_in}
                    </div>
                  </div>

                  {/* Bot reply */}
                  <div className="flex gap-2">
                    <div className="shrink-0 h-7 w-7 rounded-full bg-accent flex items-center justify-center">
                      <Bot className="h-4 w-4 text-accent-foreground" />
                    </div>
                    <div className="bg-accent/50 rounded-lg px-3 py-2 text-sm flex-1 whitespace-pre-wrap">
                      {conv.message_out}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
