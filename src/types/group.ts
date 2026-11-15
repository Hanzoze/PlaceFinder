export type GroupStatus = 'open' | 'closed';

export type Group = {
  id: string;
  name: string;
  code: string;                         // kod zaproszenia, np. K7P2QX
  createdBy: string;                    // uid twórcy
  createdAt: Date | null;               // null, dopóki serwer nie potwierdzi zapisu
  status: GroupStatus;                  // 'closed' = głosowanie zakończone, wynik zamrożony
  memberIds: string[];
  memberNames: Record<string, string>;  // uid -> nick
  placeIds: string[];                   // zaproponowane lokale, w kolejności dodania
};

export type Vote = {
  userId: string;
  placeId: string;
};

export type VoteResult = {
  placeId: string;
  count: number;
  voterIds: string[];
};
