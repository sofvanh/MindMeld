import React from 'react';
import { usePageTitle } from '../../hooks/usePageTitle';
import uniquenessWeightingDiagram from '../../assets/docs/uniqueness-weighting-diagram.png';
import divergenceWithinGroups from '../../assets/docs/divergence-within-groups.png';
import consensusBetweenGroups from '../../assets/docs/consensus-between-groups.png';
import DocsLayout from './DocsLayout';

const PhilosophyView: React.FC = () => {
  usePageTitle('Philosophy - Nexus Docs');

  return (
    <DocsLayout>
      <div className="relative px-4 max-w-screen-md mx-auto my-16">
        <h1 id="philosophy">Philosophy</h1>
        <div className="prose prose-stone max-w-none">
          <h2 id="core-design-principles">Core Design Principles</h2>
          <p>In group-discussions, every participant has their own unique perspective and opinions. These individual differences are often overshadowed by factional dynamics, where the discussion morphs into a debate between a small number of sub-groups. Nexus is designed to do the following:</p>
          <ol>
            <li>Protect unique participants and their perspectives</li>
            <li>Actively counteract the formation of factions</li>
          </ol>
          <p>These two goals lie at the core of Nexus's design.</p>
          <p>The following sections will explain the <a href="#strategies">abstract strategies used</a>, as well as go into some of the <a href="#big-picture-goals">reasons why these goals are desirable</a>.</p>

          <h2 id="strategies">Strategies</h2>
          <p>Sub-groups, or clusters of users will naturally emerge in any discussion. Nexus has three main strategies to protect unique perspectives and counteract factionalism between clusters.</p>

          <h3>1. Uniqueness</h3>
          <p>First, it is important to ensure that minority groups are not drowned out, and that their perspectives are taken seriously. This is important both because minority opinions can carry important epistemic information that should not be lost, and because many users may choose not to participate if they don't trust that their views will be acknowledged and included.</p>

          <p>Nexus weights individual users according to how unique they are by counting how many other users broadly share their opinions. This re-weighting ensures that if clusters form in the opinion landscape, <b>each cluster will get equal influence</b> on the discussion.</p>

          <figure className="my-8 mx-auto max-w-[400px]">
            <img
              src={uniquenessWeightingDiagram}
              alt="Diagram showing how uniqueness weighting works: smaller clusters get proportionally more weight to ensure equal influence"
              className="w-full"
            />
            <figcaption className="mt-2 text-sm text-gray-600">
              Each cluster gets equal influence, regardless of size. Smaller clusters (purple) are weighted more heavily than larger ones (red).
            </figcaption>
          </figure>

          <h3>2. Divergence</h3>
          <p>One of the harms of factionalism is the suppression of within-group diversity. In order to construct a united front against opposition groups, opinions which diverge from the mainline are often systematically ignored. Nexus counteracts this by <b>amplifying within-group dissent</b>, and promoting opinions which <b>open up new, non-factional fault lines</b>.</p>

          <p>The tool does this by highlighting places where opinions diverge between users who normally agree with each other. Doing this weakens the cohesion of highly polarized groups, and magnifies the diversity of the opinion landscape.</p>

          <figure className="my-8 mx-auto max-w-[400px]">
            <img
              src={divergenceWithinGroups}
              alt="Diagram illustrating how Nexus promotes divergent opinions within groups to maintain diversity"
              className="w-full"
            />
            <figcaption className="mt-2 text-sm text-gray-600">
              Nexus amplifies differences of opinion within groups to maintain internal diversity and prevent excessive polarization.
            </figcaption>
          </figure>

          <h3>3. Consensus</h3>
          <p>As a final check against factionalism, Nexus <b>amplifies ideas which bring different groups together</b>.</p>

          <p>This is done by highlighting places where opinions converge between users who normally disagree. These shared ideas can then serve to connect everyone around a unifying perspective, and prevent the discussion from becoming too fragmented.</p>

          <figure className="my-8 mx-auto max-w-[400px]">
            <img
              src={consensusBetweenGroups}
              alt="Diagram showing how Nexus identifies and promotes areas of consensus between different groups"
              className="w-full"
            />
            <figcaption className="mt-2 text-sm text-gray-600">
              Areas of agreement between typically opposing groups are highlighted to build bridges and find common ground.
            </figcaption>
          </figure>

          <h2 id="big-picture-goals">Big Picture Goals</h2>
          <p>The following are some reasons to care about protecting uniqueness, and counteracting the formation of factions.</p>

          <h3>Epistemic Diversity</h3>
          <p>There is an epistemic value to diverse opinions. Formal arguments for collective intelligence, like the <a href="https://en.wikipedia.org/wiki/Condorcet%27s_jury_theorem">Condorcet Jury Theorem</a>, classically rely on an assumption that each participant is forming their views independently. <b>Independence ensures that each participant is contributing unique evidence about what is true</b>. In practice, however, opinions between people tend to be highly correlated. Thus, the effective number of unique perspectives contributing to a discussion can be quite low.</p>
          <p>There are two ways in which promoting unique perspectives might help:</p>
          <ol>
            <li>True correlation may partly be an illusion caused by which ideas get promoted the most. By changing the incentives provided by a discussion platform, it may be possible to bring to the surface pre-existing differences of opinion that would normally be overshadowed.</li>
            <li>People may form new opinions during a discussion by taking cues from whatever group they are most similar to. If a discussion can be structured such that they are more likely to encounter ideas which don't fit neatly into pre-existing opinion groups, and there isn't a well defined group perspective, they may be encouraged to form their own distinct views.</li>
          </ol>
          <p>In this way, promoting diversity can help make the discussion more truth-seeking.</p>

          <h3>Conflict Resolution</h3>
          <p>The goal of a discussion may not be entirely epistemic, but can also have a social function. Getting distinct groups to <b>transition from an adversarial to a collaborative mode of communication</b> might be very hard. They may share fundamentally different worldviews, have genuinely diverging interests, and their interaction may lack trust.</p>
          <p>In the presence of strong social forces which reinforce the differences between groups, it may be useful for a discussion platform to nudge participants to engage with ideas which blur the boundaries of group membership, and especially ideas on which participants broadly agree.</p>
          <p>Furthermore, users are anonymous, helping to prevent people from taking their disagreements too personally, as well as limiting any implicit policing of factional boundaries through, for example, within-group reputation.</p>

          <h3>Active Learning</h3>
          <p>If we want to maximize the information that users reveal about their own beliefs (and thus the amount they are able to learn from each other), one strategy is to promote topics on which their opinions are hard to predict.</p>
          <p>When a group of people structure themselves into distinct opinion clusters, they also make themselves much easier to predict and model. By promoting statements where a user's relationships to other users does not help predict their opinion, you also <b>promote the statements which carry more non-redundant information</b>.</p>
          <p>This has parallels to active learning, where a system learns more efficiently by selecting each new piece of data to maximize information gain. If a tool optimizes for such information gain, it will naturally end up highlighting what makes each user unique, and reduce the extent to which opinions can be explained by membership to a sub-group.</p>
        </div>
      </div>
    </DocsLayout>
  );
};

export default PhilosophyView;
