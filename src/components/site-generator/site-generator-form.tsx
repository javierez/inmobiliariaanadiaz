"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";

interface JobResult {
  projectDir?: string;
  deploymentUrl?: string;
  repoUrl?: string;
}

interface Job {
  id: string;
  status: "queued" | "running" | "completed" | "failed";
  accountId: string;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  result?: JobResult;
  error?: string;
  logs: string[];
}

function StatusBadge({ status }: { status: Job["status"] }) {
  const variant =
    status === "completed"
      ? "default"
      : status === "failed"
        ? "destructive"
        : "secondary";
  return <Badge variant={variant}>{status}</Badge>;
}

export function SiteGeneratorForm() {
  const [accountId, setAccountId] = useState("");
  const [domain, setDomain] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentJob, setCurrentJob] = useState<Job | null>(null);
  const [recentJobs, setRecentJobs] = useState<Job[]>([]);

  const pollJob = useCallback(async (jobId: string) => {
    try {
      const res = await fetch(`/api/site-generator?jobId=${jobId}`);
      const job: Job = await res.json();
      setCurrentJob(job);
      if (job.status === "queued" || job.status === "running") {
        setTimeout(() => void pollJob(jobId), 3000);
      }
    } catch {
      // retry on network error
      setTimeout(() => void pollJob(jobId), 5000);
    }
  }, []);

  const loadRecentJobs = useCallback(async () => {
    try {
      const res = await fetch("/api/site-generator");
      const jobs = await res.json();
      if (Array.isArray(jobs)) setRecentJobs(jobs.slice(0, 10));
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    void loadRecentJobs();
  }, [loadRecentJobs]);

  async function handleGenerate() {
    if (!accountId.trim()) return;
    setIsSubmitting(true);
    setCurrentJob(null);

    try {
      const res = await fetch("/api/site-generator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accountId: accountId.trim(),
          domain: domain.trim() || undefined,
        }),
      });
      const data = await res.json();

      if (data.jobId) {
        setCurrentJob({
          id: data.jobId,
          status: data.status ?? "queued",
          accountId: accountId.trim(),
          createdAt: new Date().toISOString(),
          logs: [],
        });
        void pollJob(data.jobId);
      } else {
        setCurrentJob({
          id: "error",
          status: "failed",
          accountId: accountId.trim(),
          createdAt: new Date().toISOString(),
          error: data.error ?? "Unknown error",
          logs: [],
        });
      }
    } catch (error) {
      setCurrentJob({
        id: "error",
        status: "failed",
        accountId: accountId.trim(),
        createdAt: new Date().toISOString(),
        error: error instanceof Error ? error.message : "Network error",
        logs: [],
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Generate form */}
      <Card>
        <CardHeader>
          <CardTitle>Generar Sitio Web</CardTitle>
          <CardDescription>
            Genera y despliega un sitio web para una cuenta de cliente
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Account ID</label>
            <Input
              type="text"
              placeholder="Ej: 41"
              value={accountId}
              onChange={(e) => setAccountId(e.target.value)}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">
              Dominio personalizado (opcional)
            </label>
            <Input
              type="text"
              placeholder="Ej: www.ejemplo.com"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button
            onClick={handleGenerate}
            disabled={isSubmitting || !accountId.trim()}
            className="w-full"
          >
            {isSubmitting ? "Iniciando..." : "Generar Sitio"}
          </Button>
        </CardFooter>
      </Card>

      {/* Current job status */}
      {currentJob && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Estado del trabajo</CardTitle>
              <StatusBadge status={currentJob.status} />
            </div>
            <CardDescription>
              Cuenta: {currentJob.accountId} &middot; ID:{" "}
              {currentJob.id.slice(0, 8)}...
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {/* Logs */}
            {currentJob.logs.length > 0 && (
              <div className="max-h-60 overflow-y-auto rounded bg-muted p-3">
                {currentJob.logs.map((log, i) => (
                  <p
                    key={i}
                    className="font-mono text-xs text-muted-foreground"
                  >
                    {log}
                  </p>
                ))}
              </div>
            )}

            {/* Error */}
            {currentJob.error && (
              <div className="rounded bg-destructive/10 p-3 text-sm text-destructive">
                {currentJob.error}
              </div>
            )}

            {/* Results */}
            {currentJob.result && (
              <div className="flex flex-col gap-2 text-sm">
                {currentJob.result.repoUrl && (
                  <a
                    href={currentJob.result.repoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline"
                  >
                    GitHub: {currentJob.result.repoUrl}
                  </a>
                )}
                {currentJob.result.deploymentUrl && (
                  <a
                    href={currentJob.result.deploymentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline"
                  >
                    Vercel: {currentJob.result.deploymentUrl}
                  </a>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Recent jobs */}
      {recentJobs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Trabajos recientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-2">
              {recentJobs.map((job) => (
                <div
                  key={job.id}
                  className="flex items-center justify-between rounded border p-3 text-sm"
                >
                  <div>
                    <span className="font-medium">Cuenta {job.accountId}</span>
                    <span className="ml-2 text-muted-foreground">
                      {new Date(job.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <StatusBadge status={job.status} />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
