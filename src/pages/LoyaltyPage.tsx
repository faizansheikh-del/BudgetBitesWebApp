import { useState, useEffect } from "react";
import { PublicLayout } from "@/components/PublicLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Award, Plus, Trash2, Loader2, Gift, Star, Edit2, Check, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

type LoyaltyProgram = {
  id: string;
  store_name: string;
  program_name: string;
  current_points: number;
  reward_threshold: number;
  reward_description: string;
};

const storeOptions = ["Aldi", "Trader Joe's", "Walmart", "Costco", "Whole Foods", "Kroger", "Other"];

export default function LoyaltyPage() {
  const [programs, setPrograms] = useState<LoyaltyProgram[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editPoints, setEditPoints] = useState("");
  const { user } = useAuth();
  const { toast } = useToast();

  // Form state
  const [storeName, setStoreName] = useState("Walmart");
  const [programName, setProgramName] = useState("");
  const [currentPoints, setCurrentPoints] = useState("0");
  const [rewardThreshold, setRewardThreshold] = useState("100");
  const [rewardDescription, setRewardDescription] = useState("");

  const fetchPrograms = async () => {
    if (!user) { setLoading(false); return; }
    setLoading(true);
    const { data } = await supabase
      .from("loyalty_programs")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    if (data) setPrograms(data.map(p => ({
      ...p,
      current_points: Number(p.current_points),
      reward_threshold: Number(p.reward_threshold),
    })));
    setLoading(false);
  };

  useEffect(() => { fetchPrograms(); }, [user]);

  const handleSubmit = async () => {
    if (!user) { toast({ title: "Please sign in" }); return; }
    if (!programName.trim()) { toast({ title: "Enter a program name" }); return; }
    setSubmitting(true);
    const { error } = await supabase.from("loyalty_programs").insert({
      user_id: user.id,
      store_name: storeName,
      program_name: programName.trim(),
      current_points: parseFloat(currentPoints) || 0,
      reward_threshold: parseFloat(rewardThreshold) || 100,
      reward_description: rewardDescription.trim(),
    });
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Program added!" });
      setShowForm(false);
      setProgramName(""); setCurrentPoints("0"); setRewardThreshold("100"); setRewardDescription("");
      fetchPrograms();
    }
    setSubmitting(false);
  };

  const updatePoints = async (id: string) => {
    const pts = parseFloat(editPoints);
    if (isNaN(pts)) return;
    await supabase.from("loyalty_programs").update({ current_points: pts }).eq("id", id);
    setEditingId(null);
    fetchPrograms();
    toast({ title: "Points updated!" });
  };

  const deleteProgram = async (id: string) => {
    await supabase.from("loyalty_programs").delete().eq("id", id);
    toast({ title: "Program removed" });
    fetchPrograms();
  };

  const totalPoints = programs.reduce((s, p) => s + p.current_points, 0);
  const nearReward = programs.filter(p => p.current_points / p.reward_threshold >= 0.8);

  return (
    <PublicLayout>
      <div className="container px-4 md:px-6 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Loyalty Tracker</h1>
            <p className="text-muted-foreground mt-1">Track your store rewards and points in one place</p>
          </div>
          <Button onClick={() => setShowForm(!showForm)}>
            <Plus className="h-4 w-4 mr-1.5" />
            {showForm ? "Cancel" : "Add Program"}
          </Button>
        </div>

        {!user && (
          <Card className="mb-6 border-primary/30 bg-primary/5">
            <CardContent className="p-4 text-center">
              <p className="text-sm text-muted-foreground">Sign in to start tracking your loyalty programs.</p>
            </CardContent>
          </Card>
        )}

        {/* Stats */}
        {programs.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
            <Card>
              <CardContent className="p-4 text-center">
                <Award className="h-5 w-5 text-primary mx-auto mb-1" />
                <p className="text-lg font-bold text-foreground">{programs.length}</p>
                <p className="text-xs text-muted-foreground">Active Programs</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Star className="h-5 w-5 text-warning mx-auto mb-1" />
                <p className="text-lg font-bold text-foreground">{totalPoints.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Total Points</p>
              </CardContent>
            </Card>
            <Card className="col-span-2 md:col-span-1">
              <CardContent className="p-4 text-center">
                <Gift className="h-5 w-5 text-primary mx-auto mb-1" />
                <p className="text-lg font-bold text-foreground">{nearReward.length}</p>
                <p className="text-xs text-muted-foreground">Near Reward</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Add Form */}
        {showForm && (
          <Card className="mb-8">
            <CardHeader><CardTitle className="text-lg">Add Loyalty Program</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm">Store</Label>
                  <Select value={storeName} onValueChange={setStoreName}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {storeOptions.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-sm">Program Name</Label>
                  <Input value={programName} onChange={e => setProgramName(e.target.value)} placeholder="e.g. Kroger Plus" className="mt-1" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm">Current Points</Label>
                  <Input type="number" value={currentPoints} onChange={e => setCurrentPoints(e.target.value)} className="mt-1" />
                </div>
                <div>
                  <Label className="text-sm">Reward Threshold</Label>
                  <Input type="number" value={rewardThreshold} onChange={e => setRewardThreshold(e.target.value)} className="mt-1" />
                </div>
              </div>
              <div>
                <Label className="text-sm">Reward Description</Label>
                <Input value={rewardDescription} onChange={e => setRewardDescription(e.target.value)} placeholder="e.g. $5 off next purchase" className="mt-1" />
              </div>
              <Button onClick={handleSubmit} disabled={submitting} className="w-full">
                {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : <Plus className="h-4 w-4 mr-1.5" />}
                Add Program
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Program Cards */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : programs.length === 0 ? (
          <div className="text-center py-16">
            <Award className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground">No loyalty programs added. Click "Add Program" to get started.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {programs.map(program => {
              const progress = Math.min((program.current_points / program.reward_threshold) * 100, 100);
              const isClose = progress >= 80;
              const isComplete = progress >= 100;

              return (
                <Card key={program.id} className={`hover:shadow-lg transition-all hover:-translate-y-0.5 ${isComplete ? "border-primary ring-1 ring-primary/20" : ""}`}>
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-foreground">{program.store_name}</h3>
                        <p className="text-xs text-muted-foreground">{program.program_name}</p>
                      </div>
                      {isComplete ? (
                        <Badge className="bg-primary text-primary-foreground text-[10px]">🎉 Reward Ready!</Badge>
                      ) : isClose ? (
                        <Badge variant="secondary" className="text-[10px] text-warning">Almost There!</Badge>
                      ) : null}
                    </div>

                    <div className="mb-3">
                      <div className="flex justify-between text-sm mb-1">
                        {editingId === program.id ? (
                          <div className="flex items-center gap-1">
                            <Input
                              type="number"
                              value={editPoints}
                              onChange={e => setEditPoints(e.target.value)}
                              className="h-7 w-20 text-xs"
                              autoFocus
                            />
                            <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => updatePoints(program.id)}>
                              <Check className="h-3 w-3" />
                            </Button>
                            <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => setEditingId(null)}>
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ) : (
                          <span
                            className="font-bold text-foreground cursor-pointer hover:text-primary flex items-center gap-1"
                            onClick={() => { setEditingId(program.id); setEditPoints(program.current_points.toString()); }}
                          >
                            {program.current_points.toLocaleString()} pts
                            <Edit2 className="h-3 w-3 text-muted-foreground" />
                          </span>
                        )}
                        <span className="text-muted-foreground">{program.reward_threshold.toLocaleString()} pts</span>
                      </div>
                      <Progress value={progress} className="h-2" />
                      <p className="text-[10px] text-muted-foreground mt-1">
                        {isComplete
                          ? "You've earned a reward!"
                          : `${(program.reward_threshold - program.current_points).toLocaleString()} pts to go`}
                      </p>
                    </div>

                    {program.reward_description && (
                      <div className="bg-muted/50 rounded-lg p-2 mb-3">
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Gift className="h-3 w-3" /> {program.reward_description}
                        </p>
                      </div>
                    )}

                    <Button variant="ghost" size="sm" className="w-full text-xs text-destructive hover:text-destructive" onClick={() => deleteProgram(program.id)}>
                      <Trash2 className="h-3 w-3 mr-1" /> Remove
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </PublicLayout>
  );
}
