export interface IActiveCalls { // directly from 3CX dashboard API
  Callee: string;
  Caller: string;
  EstablishedAt: string;
  Id: number;
  LastChangeStatus: string;
  Status: string;
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