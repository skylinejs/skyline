---
slug: complexity-incentive-mismatch
title: On the Complexity Incentive Mismatch in Software Development
authors: william
tags: [software development, philosophy]
---

# On the Complexity Incentive Mismatch in Software Development

Complexity bad, very bad. Every developer either quits the profession or works long enough to painfully learn this lesson. However, even if an experienced developer knows to avoid complexity like its the plague, it still might not be in their best interest to do so. This is bad news as it is already difficult enough to keep complexity out of large codebase with multiple contributors.

Meet Jeffry. Jeffry is a senior solution architect with stronlgy held opinions and an even stronger disliking of office politics. Jeffry gets parachuted into yet another development project that has the usual suspects: couple of junior devs, a scrum master, a compliance officer, a DevOps specialist and an MBA to keep it all together.

Jeffry has to make a choice: He can take on the challenge and pour his efforts into the project. He knows from the previous times around that he will have to patient with the junior devs, fight off their attempts to introduce Kubernetes, GraphhQL schema federation or GraphQL at all for that matter. He will have to sit through the daily stand up meetings and discuss whether to give 4 or 8 storypoints to a bug without even knowning how much time a storypoint represents. He will have to stop the compliance officer from making the signup process unusable and make the MBA look good in front of management and compliment his spreadsheets.

Jeffry knows in his heart that this is the right path. However, there is the right path and then there is the smart path. Let's look a Jeffry's goals that he wants to achieve at his workplace:

- Income security and a career path to increase his salary
- Interesting technical challenges and the autonomy to solve them how he sees fit
- Flexible working hours and holidays in order to fulfill his responsibilities outside work towards his family and friends

Choosing the right path does not get Jeffry any closer to his goals. If he fights for a simple and elegant codebase, he only upsets the other developers as he has to disagree a lot and say "no" much more than "yes". Furthermore, a simple and well documented codebase is easy to understand and maintain. This is detrimental to Jeffry's career goals as he makes himself easily replaceable. Management can just assign another developer to the project as Jeffry's knowledge is not only in his head but accessible via the documentation and by reading the code. Jeffry would create much more leverage for himself by creating a complex codebase that only he knows how to evolve and maintain. He can use this leverage when negotiating his salary, working hours and so on.

The best part is that Jeffry does not even need malicious or selfish intent to create a messy codebase and therefore the necessary leverage for himself. It is simply the default outcome of a development project if nobody stands up and fights it on a daily basis.

The incentive structure unfortunately does not get better for the other participants. Let's take the compliance officer: His job is to make sure that data protection laws, GDPR and all the other regulations are met. From a project perspective, fulfilling each compliance rule word by word is not productive as it would kill the primary objective of the project by making the application unusable. In the end, the most compliant software is the one that has no users. This tradeoff does not exist for the compliance officer. His work only gets measured by how many compliance violations occur on his watch. There is simply no incentive to find a middle ground as he can only loose but has nothing to gain.

Hopefully this example demonstrates an inevitable truth: You cannot ignore office politics, incentive and governance structures. No matter how many technical challenges you solve, the project is destined to fail if you don't get the incentives right. It is the foundation that is necessary to do any of the "real" work.
