import { useState } from "react";
import { PiThumbsUp, PiThumbsDown, PiQuestion, PiCaretDown, PiCaretRight, PiArrowSquareOut } from "react-icons/pi";
import { getColor } from "../../utils/colors";
import { Argument } from "../../shared/types";

interface StatementCardProps {
  statement: Argument;
  index: number;
}

export const StatementCard = ({ statement, index }: StatementCardProps) => {
  const [showPosts, setShowPosts] = useState(false);
  const hasPosts = statement.sourcePosts && statement.sourcePosts.length > 0;

  return (
    <div
      className="p-4 rounded-lg border border-stone-200 animate-fade-in-up"
      style={{ borderLeftColor: getColor(statement), borderLeftWidth: '6px' }}
    >
      <div className="flex items-start gap-3">
        <div className="text-sm font-medium text-stone-500 mt-1">{index + 1}</div>
        <div className="flex-1">
          <div className="flex items-start justify-between">
            <p className="m-0 mb-1 font-medium flex-1">{statement.statement}</p>
            {hasPosts && (
              <button
                onClick={() => setShowPosts(!showPosts)}
                className="ml-2 flex items-center gap-1 text-sm text-stone-500 hover:text-stone-700 transition-colors"
              >
                {showPosts ? <PiCaretDown /> : <PiCaretRight />}
                <span>{statement.sourcePosts!.length} post{statement.sourcePosts!.length !== 1 ? 's' : ''}</span>
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center">
            <div className="flex items-center gap-1 mr-4">
              <PiThumbsUp className="text-emerald-500" />
              <small className="mr-2">{statement.reactionCounts?.agree || 0}</small>
              <PiThumbsDown className="text-red-500" />
              <small className="mr-2">{statement.reactionCounts?.disagree || 0}</small>
              <PiQuestion className="text-amber-500" />
              <small>{statement.reactionCounts?.unclear || 0}</small>
            </div>
            {statement.score && (
              <div className="flex flex-wrap items-center">
                <div className="flex items-center gap-1 mr-4">
                  <small className="font-medium">Consensus</small>
                  <small>{(statement.score.consensus || 0).toFixed(2)}</small>
                </div>
                <div className="flex items-center gap-1 mr-4">
                  <small className="font-medium">Divergence</small>
                  <small>{(statement.score.fragmentation || 0).toFixed(2)}</small>
                </div>
                <div className="flex items-center gap-1">
                  <small className="font-medium">Quality</small>
                  <small>{(statement.score.clarity || 0).toFixed(2)}</small>
                </div>
              </div>
            )}
          </div>

          {/* Expandable Posts Section */}
          {showPosts && hasPosts && (
            <div className="mt-4 border-t border-stone-200 pt-4">
              <h5 className="text-sm font-medium text-stone-700 mb-3">Source Posts</h5>
              <div className="space-y-3">
                {statement.sourcePosts!.map((post, postIndex) => (
                  <div key={postIndex} className="bg-stone-50 p-3 rounded border">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs font-medium text-stone-600">
                            @{post.authorId}
                          </span>
                          <div className="flex items-center gap-1">
                            <PiThumbsUp className="text-emerald-500 w-3 h-3" />
                            <span className="text-xs text-emerald-600 font-medium">Supporting</span>
                          </div>
                        </div>
                        {post.text && (
                          <p className="text-sm text-stone-700 mb-2">{post.text}</p>
                        )}
                      </div>
                      <a
                        href={post.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-2 text-stone-400 hover:text-stone-600 transition-colors"
                        title="View on Bluesky"
                      >
                        <PiArrowSquareOut className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
