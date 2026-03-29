'use client';

import { useEffect } from 'react';
import { useHackathonStore } from '@/store/hackathon';
import { useTeamStore } from '@/store/team';
import { useUserStore } from '@/store/user';
import { useSubmissionStore } from '@/store/submission';
import { useCommunityStore } from '@/store/community';
import { useMessageStore } from '@/store/message';
import { useRankingStore } from '@/store/ranking';
import { useMissionStore } from '@/store/mission';

export default function StoreInitializer() {
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
  }, [initHackathon, initTeam, initUser, initSubmission, initCommunity, initMessage, initRanking, initMission]);

  return null;
}
