import { BatchableAction } from './batchableAction';
import { processArgumentBatch } from './argument/processArgumentBatch';

class BatchManager {
  private pendingActions: BatchableAction[] = [];
  private batchTimeout: NodeJS.Timeout | null = null;
  private maxTimeout: NodeJS.Timeout | null = null;
  private firstActionTime: number | null = null;
  private readonly BATCH_DELAY = 5000; // 5 seconds
  private readonly MAX_DELAY = 15000; // 15 seconds

  addAction(action: BatchableAction) {
    if (!this.firstActionTime) {
      this.firstActionTime = Date.now();
      this.maxTimeout = setTimeout(() => {
        this.processBatch();
      }, this.MAX_DELAY);
    }

    this.pendingActions.push(action);

    if (this.batchTimeout) {
      clearTimeout(this.batchTimeout);
    }

    this.batchTimeout = setTimeout(() => {
      this.processBatch();
    }, this.BATCH_DELAY);
  }

  private async processBatch() {
    if (this.batchTimeout) {
      clearTimeout(this.batchTimeout);
    }
    if (this.maxTimeout) {
      clearTimeout(this.maxTimeout);
    }

    this.batchTimeout = null;
    this.maxTimeout = null;
    this.firstActionTime = null;

    const actions = [...this.pendingActions];
    this.pendingActions = [];

    const argumentActions = actions.filter(a => a.type === 'add argument');
    const reactionActions = actions.filter(a => a.type === 'add reaction' || a.type === 'remove reaction');

    try {
      await Promise.all([
        processArgumentBatch(argumentActions)
        // this.processReactionBatch(reactionActions)
      ]);
      actions.forEach(action => {
        action.callback({
          success: true
        });
      });
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