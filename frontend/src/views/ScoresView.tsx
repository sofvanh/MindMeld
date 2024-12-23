import React from 'react';
import { Link } from 'react-router-dom';
import { CONSENSUS_COLOR, FRAGMENTATION_COLOR, IMPORTANCE_COLOR, BASE_COLOR } from '../utils/colors';


// TODO Rewrite this page, this is all Claude

export default function ScoresView() {
  const scoreTypes = [
    {
      name: 'Consensus Score',
      color: CONSENSUS_COLOR,
      description: 'Measures how surprisingly high the agreement is among users who have rated this argument.',
      details: [
        'High when many users agree, especially users who often disagree with each other',
        'Low when there is typical or less agreement than expected',
        'Not affected by "Unclear" reactions'
      ]
    },
    {
      name: 'Fragmentation Score',
      color: FRAGMENTATION_COLOR,
      description: 'Measures how surprisingly high the disagreement is among users who have rated this argument.',
      details: [
        'High when users are unexpectedly divided on this argument',
        'Low when users agree as much as they typically do',
        'Not affected by "Unclear" reactions'
      ]
    },
    {
      name: 'Clarity Score',
      color: null,
      description: 'Measures how clear and understandable the argument is to users.',
      details: [
        'High when few users mark the argument as unclear',
        'Low when many users find the argument confusing',
        'Shown through opacity - less clear arguments appear more transparent',
        'Based only on "Unclear" reactions'
      ]
    }
  ];

  const clarityExamples = [
    { opacity: 1 },
    { opacity: 0.75 },
    { opacity: 0.5 },
    { opacity: 0.25 },
    { opacity: 0 }
  ];

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1>Understanding Argument Scores</h1>

      <p className="mb-8">
        MindMeld uses three different scores to help identify interesting and important arguments.
        Each score ranges from 0% to 100% and is calculated based on user reactions.
      </p>

      {scoreTypes.map(({ name, color, description, details }) => (
        <div key={name} className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <h2 className="m-0">{name}</h2>
            {color && (
              <div
                className="w-4 h-4 rounded"
                style={{
                  backgroundColor: `rgba(${color.r}, ${color.g}, ${color.b}, 0.5)`,
                }}
              />
            )}
            {name === 'Clarity Score' && (
              <div className="flex gap-1">
                {clarityExamples.map(({ opacity }) => (
                  <div
                    key={opacity}
                    className="w-4 h-4 rounded"
                    style={{
                      backgroundColor: `rgba(${BASE_COLOR.r}, ${BASE_COLOR.g}, ${BASE_COLOR.b}, ${opacity})`,
                      border: '1px solid rgba(0,0,0,0.1)'
                    }}
                  />
                ))}
              </div>
            )}
          </div>
          <p className="mb-4">{description}</p>
          <ul className="list-disc pl-5 mb-4">
            {details.map((detail, index) => (
              <li key={index} className="mb-2 text-stone-700">{detail}</li>
            ))}
          </ul>
        </div>
      ))}

      <div className="mt-12 p-4 bg-stone-50 rounded-lg">
        <h3 className="mb-2">Important Arguments</h3>
        <div className="flex items-center gap-2 mb-4">
          <div
            className="w-4 h-4 rounded"
            style={{
              backgroundColor: `rgba(${IMPORTANCE_COLOR.r}, ${IMPORTANCE_COLOR.g}, ${IMPORTANCE_COLOR.b}, 0.5)`,
            }}
          />
          <p className="m-0">Highlighted in yellow</p>
        </div>
        <p>
          Arguments with both high consensus and high fragmentation scores are marked as important.
          These arguments tend to reveal interesting differences in how users think about the topic.
        </p>
      </div>

      <div className="mt-12">
        <Link to="/graphs" className="text-sky-500 hover:text-sky-700">
          ← Back to graphs
        </Link>
      </div>
    </div>
  );
}