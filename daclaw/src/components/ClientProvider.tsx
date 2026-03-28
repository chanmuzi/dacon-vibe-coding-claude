'use client';

import { useEffect, useState } from 'react';
import { useHackathonStore } from '@/store/hackathon';
import { useTeamStore } from '@/store/team';
import { useUserStore } from '@/store/user';
import { useSubmissionStore } from '@/store/submission';
import { useCommunityStore } from '@/store/community';
import { useMessageStore } from '@/store/message';
import { useRankingStore } from '@/store/ranking';
import { useMissionStore } from '@/store/mission';

export default function ClientProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);

  const initHackathon = useHackathonStore((s) => s.init);
  const initTeam = useTeamStore((s) => s.init);
  const initUser = useUserStore((s) => s.init);
  const initSubmission = useSubmissionStore((s) => s.init);
  const initCommunity = useCommunityStore((s) => s.init);
  const initMessage = useMessageStore((s) => s.init);
  const initRanking = useRankingStore((s) => s.init);
  const initMission = useMissionStore((s) => s.init);

  useEffect(() => {
    initHackathon();
    initTeam();
    initUser();
    initSubmission();
    initCommunity();
    initMessage();
    initRanking();
    initMission();
    setReady(true);
  }, [initHackathon, initTeam, initUser, initSubmission, initCommunity, initMessage, initRanking, initMission]);

  if (!ready) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-border rounded-lg w-1/3" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-surface border border-border rounded-xl h-64" data-testid="skeleton-loader" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
