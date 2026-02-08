import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface MilestoneWithProject {
  id: string;
  title: string;
  amount: number;
  due_date: string;
  project: {
    id: string;
    title: string;
    user_id: string;
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const threeDaysAhead = new Date(today);
    threeDaysAhead.setDate(threeDaysAhead.getDate() + 3);

    const results = {
      reminders_sent: 0,
      overdue_notifications: 0,
      errors: [] as string[],
    };

    // 1. Find milestones due within 3 days (for reminder)
    const { data: upcomingMilestones, error: upcomingError } = await supabase
      .from("milestones")
      .select(`
        id,
        title,
        amount,
        due_date,
        project:projects(id, title, user_id)
      `)
      .eq("is_paid", false)
      .gte("due_date", today.toISOString().split("T")[0])
      .lte("due_date", threeDaysAhead.toISOString().split("T")[0]);

    if (upcomingError) {
      results.errors.push(`Upcoming milestones error: ${upcomingError.message}`);
    } else if (upcomingMilestones) {
      for (const milestone of upcomingMilestones as unknown as MilestoneWithProject[]) {
        if (!milestone.project?.user_id) continue;

        // Get user profile for phone
        const { data: profile } = await supabase
          .from("profiles")
          .select("phone, full_name")
          .eq("user_id", milestone.project.user_id)
          .single();

        if (profile?.phone) {
          // Send SMS reminder
          const message = `🔔 Digiwebdex: Milestone "${milestone.title}" for "${milestone.project.title}" is due on ${milestone.due_date}. Amount: ৳${milestone.amount}. Please make payment to avoid delays.`;

          try {
            await supabase.functions.invoke("send-sms", {
              body: { phone: profile.phone, message },
            });
            results.reminders_sent++;
          } catch (smsError) {
            results.errors.push(`SMS error for milestone ${milestone.id}: ${smsError}`);
          }
        }

        // Create notification record
        await supabase.from("notifications").insert({
          user_id: milestone.project.user_id,
          notification_type: "sms",
          recipient: profile?.phone || "unknown",
          subject: "Milestone Payment Reminder",
          body: `Milestone "${milestone.title}" is due on ${milestone.due_date}`,
          status: "sent",
          sent_at: new Date().toISOString(),
          metadata: {
            milestone_id: milestone.id,
            project_id: milestone.project.id,
            type: "reminder",
          },
        });
      }
    }

    // 2. Find overdue milestones (past due date)
    const { data: overdueMilestones, error: overdueError } = await supabase
      .from("milestones")
      .select(`
        id,
        title,
        amount,
        due_date,
        project:projects(id, title, user_id)
      `)
      .eq("is_paid", false)
      .lt("due_date", today.toISOString().split("T")[0]);

    if (overdueError) {
      results.errors.push(`Overdue milestones error: ${overdueError.message}`);
    } else if (overdueMilestones) {
      for (const milestone of overdueMilestones as unknown as MilestoneWithProject[]) {
        if (!milestone.project?.user_id) continue;

        // Get user profile
        const { data: profile } = await supabase
          .from("profiles")
          .select("phone, full_name")
          .eq("user_id", milestone.project.user_id)
          .single();

        if (profile?.phone) {
          // Send overdue notification
          const message = `⚠️ Digiwebdex: Milestone "${milestone.title}" for "${milestone.project.title}" is OVERDUE. Amount: ৳${milestone.amount}. Please pay immediately to continue project work.`;

          try {
            await supabase.functions.invoke("send-sms", {
              body: { phone: profile.phone, message },
            });
            results.overdue_notifications++;
          } catch (smsError) {
            results.errors.push(`Overdue SMS error for milestone ${milestone.id}: ${smsError}`);
          }
        }

        // Notify admin about overdue
        const adminMessage = `⚠️ Overdue Milestone Alert!\n\nProject: ${milestone.project.title}\nMilestone: ${milestone.title}\nAmount: ৳${milestone.amount}\nDue Date: ${milestone.due_date}\nClient: ${profile?.full_name || "Unknown"}`;

        const adminPhone = Deno.env.get("ADMIN_PHONE");
        if (adminPhone) {
          try {
            await supabase.functions.invoke("send-sms", {
              body: { phone: adminPhone, message: adminMessage },
            });
          } catch (adminSmsError) {
            results.errors.push(`Admin SMS error: ${adminSmsError}`);
          }
        }
      }
    }

    console.log("Milestone reminder cron results:", results);

    return new Response(JSON.stringify(results), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Milestone reminder cron error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
