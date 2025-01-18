import { BatchableAction } from './batchableAction';
import { processArgumentBatch } from './argument/processArgumentBatch';

class BatchManager {
  private pendingActions: BatchableAction[] = [];
  private batchTimeout: NodeJS.Timeout | null = null;
  private readonly BATCH_DELAY = 5000; // 5 seconds

  addAction(action: BatchableAction) {
    this.pendingActions.push(action);

    if (!this.batchTimeout) {
      this.batchTimeout = setTimeout(() => {
        this.processBatch();
      }, this.BATCH_DELAY);
    }
  }

  private async processBatch() {
    const actions = [...this.pendingActions];
    this.pendingActions = [];
    this.batchTimeout = null;

    const argumentActions = actions.filter(a => a.type === 'add argument');
    const reactionActions = actions.filter(a => a.type === 'add reaction' || a.type === 'remove reaction');

    try {
      await Promise.all([
        processArgumentBatch(argumentActions)
        // this.processReactionBatch(reactionActions)
      ]);
    } catch (error) {
      console.error('Batch processing error:', error);
      actions.forEach(action => {
        action.callback({
          success: false,
          error: 'Batch processing failed'
        });
      });
    }
  }
}

const batchManager = new BatchManager();
export default batchManager;