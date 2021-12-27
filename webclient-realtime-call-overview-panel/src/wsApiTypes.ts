export interface ActiveCall {
  id: number,
  establishedAt: string,
  from: CallerInfo,
  lastChangeStatus: string,
  status: string,
  to: CallerInfo,
}

export type IncomingOutgoing = 'incoming' | 'outgoing';
export type CallerType = 'IVR' | 'Voicemail' | 'Internal' | 'External' | 'Other'

export interface CallerInfo {
  displayName?: string,
  phoneBookId?: number, // foreign key of public.phonebook.idphonebook
  phoneNumber?: string,
  type: CallerType,
}

export interface CallSegment {
  direction: IncomingOutgoing,
  endTime: string;
  from: CallerInfo;
  segmentId: number,
  startTime: string;
  to: CallerInfo;
}

export interface CallLog {
  id: number,
  answered: boolean,
  direction: IncomingOutgoing,
  endTime: string,
  extCaller: CallerInfo,
  segments: CallSegment[],
  startTime: string,
  talkingDuration?: string,
}