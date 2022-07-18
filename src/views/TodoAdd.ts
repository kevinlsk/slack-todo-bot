import { ModalView } from '@slack/bolt';

export default function viewAddPayload(triggerId: string): ModalView {
  return {
    // Pass a valid trigger_id within 3 seconds of receiving it
    trigger_id: triggerId,
    // View payload
    view: {
      type: 'modal',
      // View identifier
      callback_id: 'view_1',
      title: {
        type: 'plain_text',
        text: 'Modal title'
      },
      blocks: [],
      submit: {
        type: 'plain_text',
        text: 'Submit'
      }
    }
  }
}