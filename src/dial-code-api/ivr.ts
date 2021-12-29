import { ActiveCall, offActiveCallsChange, onActiveCallsChange } from '../func/active-calls';
import { rename, stat } from 'fs/promises';

import { DialCodeAction } from './dial-code-api';
import { api } from '../api/connection';
import { getConfig } from '../config';
import { join } from 'path';

const MAX_WAIT_FOR_CALL_SEC = 5 * 60; // timeout = 5 minutes

export interface RecordIvrAction extends DialCodeAction {
  fileName: string,
  ivrExt: number,
}

async function waitForRecordCallFinished(phoneNumber: string) {
  return new Promise<void>((resolve, reject) => {
    const timeout = setTimeout(() => {
      offActiveCallsChange(handler);
      reject(new Error(`max wait time (${MAX_WAIT_FOR_CALL_SEC} seconds) elapsed`))
    }, MAX_WAIT_FOR_CALL_SEC * 1000);

    onActiveCallsChange(handler);

    let callId: number;
    function handler(activeCalls: ActiveCall[]) {
      // a record call looks like from.phonenumber = to.phonenumber
      // e.g. From: 100 XYZ -- To: 100 XYZ
      const call = activeCalls.find(c => 
        c.to.phoneNumber === phoneNumber
        && c.from.phoneNumber === phoneNumber)
      if (call && !callId) {
        callId = call.id;
      } else if (!call && callId) {
        clearTimeout(timeout);
        offActiveCallsChange(handler);
        resolve();
      }
    }
  });
}

async function getIvrSettings(ivrExt: number) {
  const ivrList = await api.consoleClient.getIVRList();
  const ivr = ivrList.find(ivr => ivr?.Number.toString() === ivrExt.toString());
  if (!ivr)
    throw new Error(`IVR with extension number ${ivrExt} not found`);

  return api.consoleClient.getIVRSettings(ivr.Id);
}

export async function recordIvr(action: RecordIvrAction, call: ActiveCall) {
  const recordWithExtensionNr = call.from.phoneNumber;
  if (!recordWithExtensionNr)
    throw new Error(`Caller number is undefined`);

  const properFileName = action.fileName.toLowerCase().endsWith('.wav')
    ? action.fileName
    : action.fileName + '.wav';

  let ivrSettings = await getIvrSettings(action.ivrExt);

  const tempName = properFileName + '-tmp-' + Date.now() + '.wav';
  const waitForCall = waitForRecordCallFinished(recordWithExtensionNr);
  await api.consoleClient.recordFile({
    ExtId: recordWithExtensionNr,
    Id: ivrSettings.Id.toString(),
    Name: tempName,
    PropertyPath: "[{\"Name\":\"Prompt\"}]",
    ObjectId: ivrSettings.ActiveObject.Id,
  });
  await waitForCall;

  await new Promise((resolve) => setTimeout(resolve, 1000));
  try {
    // check if file exists
    await stat(join(getConfig().ivrPromptsDir, tempName));
  } catch (err) {
    // if user cancelled recording
    return;
  }

  // overwrites old file
  await rename(
    join(getConfig().ivrPromptsDir, tempName), 
    join(getConfig().ivrPromptsDir, properFileName));

  // Workaround: 
  // 3CX will not pick up changes to audio files if the name stays the same.
  // Therefore, we mut toggle between different values to apply changes.
  ivrSettings = await getIvrSettings(action.ivrExt);
  await api.consoleClient.updateIVRSettings({
    PropertyValue: "Empty.wav", // should always be existent
    Path: {
      ObjectId: ivrSettings.Id.toString(),
      PropertyPath: [{Name: "Prompt"}],
    }
  });
  await api.consoleClient.saveIVRSettings(ivrSettings.Id.toString());

  ivrSettings = await getIvrSettings(action.ivrExt);
  await api.consoleClient.updateIVRSettings({
    PropertyValue: properFileName,
    Path: {
      ObjectId: ivrSettings.Id.toString(),
      PropertyPath: [{Name: "Prompt"}],
    }
  });
  await api.consoleClient.saveIVRSettings(ivrSettings.Id.toString());
}