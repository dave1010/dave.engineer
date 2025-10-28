---
title: "The Unimaginable Sizes of Graham's Number and Other Large Numbers"
date: 2024-04-22
tags:
  - math
type: til
---
I was talking to my kids about large numbers like a googol (10^100) and a googolplex. I knew bits and pieces about bigger number but not enough to confidently explain it until now.

## Addition, multiplication, iteration and tetration

First, let's see how operations are just repeats of the previous operation.

- multiplication: 3×3 is just releated addition, 3+3+3 = 9
- exponention: 3^3 is just repeated multiplication, 3×3×3 = 27
- tetration: 3↑↑3 is just repeated exponention, 3^3^3 = about 8 billion 

## Writing a Googolplex

A googolplex is an enormous number defined as 10^10^100. That's a 1 followed by a googol (10^100) zeros! It's impossible to write down in normal notation due to its sheer size.

## Beyond Exponential Notation

There are numbers so big that they can't be expressed using exponential notation. These require other methods, such as [Knuth's up-arrow notation](https://en.wikipedia.org/wiki/Knuth%27s_up-arrow_notation), which allows us to describe numbers that are exponentially bigger than a googolplex.


- **3↑↑3** (3 double arrow 3) signifies a number where 3 is raised to the power of itself, repeated 27 times (since 3^3 = 27). Three to the power of three to the power of three to the power of three... (27 times). This results in 7,625,597,484,987 - about 8 billion.
- **3↑↑↑3** (3 triple arrow 3) takes this concept to the next level by stacking a power tower of 3's that is 7,625,597,484,987 layers high. This is far more than a googolplex and is virtually incomprehensible in size. It would take about 30,000 years to say "three to the power of..." 8 billion times (trust me on this). Compare this to a googolplex, where you can say "ten to the power of ten to the power of a hundred" in 3 seconds.
- **3↑↑↑↑3** (3 quadruple arrow 3) increases complexity further. Instead of just 8 billion 3's stacked in a power tower, there's so many 3s that it would take 30,000 years to just say how many 3's there are! If each atom in our universe could represent "3 to the power of," there still wouldn't be enough to describe how big the number is.

You can see how ↑ notation can quickly lead to large numbers, even with just 4 of them.

## Graham's Number

Then there's Graham's number, perhaps the most famous of very very large numbers. Here's how it builds:

We start off with 3↑↑↑↑3. Remember that this number takes 30,000 years to describe the the height of the power tower: the power tower isn't just billions or googols tall, it's more than the number of atoms in the universe tall.

We call this g₁.

The next level is g₂. This is 3, with g₁ up arrows then a other 3. You saw how quickly the numbers grew when we went from 2, to 3, to 4 up arrows. Now we're at an impossibility large number of up arrows.

This process continues, where we take a number that we can't even describe with up arrows, then use that many up arrows between two 3's. 

We keep doing this 64 times to get Graham's number.
