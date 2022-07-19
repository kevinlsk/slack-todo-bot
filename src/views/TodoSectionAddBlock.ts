import { SectionBlock } from '@slack/bolt';

export function TodoSectionAddBlock(actionID: string): SectionBlock {
  const sectionAdd: SectionBlock = {
    type: 'section',
    text: {
      type: 'mrkdwn',
      text: '*TODO List*'
    },
    accessory: {
      type: "button",
      style: 'primary',
      text: {
        type: 'plain_text',
        text: '+ Add',
      },
      action_id: actionID
    }
  };

  return sectionAdd;
}
