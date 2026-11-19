// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Omer / FileBekcisi. All rights reserved.

import { Calculator, MapPin, Send, type LucideIcon } from 'lucide-react';
import type { AppDictionary } from '@/i18n';

/**
 * Props accepted by the `HowItWorksSection` informational component.
 */
export interface HowItWorksSectionProps {
  /** Active localized copy dictionary. */
  readonly dictionary: AppDictionary;
}

interface WorkflowStepCardProps {
  readonly icon: LucideIcon;
  readonly indexTag: string;
  readonly title: string;
  readonly description: string;
}

/**
 * Glassmorphic step card displaying one sequential stage of the Electric Pitch brokerage workflow.
 *
 * @param props - `WorkflowStepCardProps` containing step icon, sequence tag, title, and description.
 * @returns Rendered dark step card.
 */
function WorkflowStepCard({
  icon: Icon,
  indexTag,
  title,
  description,
}: WorkflowStepCardProps): React.JSX.Element {
  return (
    <div className="rounded-lg border border-white/[0.08] bg-[#12181F]/90 p-6 backdrop-blur-md transition duration-150 hover:border-[#14E777]/35 hover:bg-[#1A232C]">
      <div className="flex items-center justify-between">
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-[#14E777]/30 bg-[#14E777]/10 text-[#14E777]">
          <Icon className="h-4 w-4" aria-hidden="true" />
        </span>
        <span className="font-heading text-xs font-medium tracking-[0.08em] text-[#64748B]">
          {indexTag}
        </span>
      </div>
      <h3 className="mt-5 font-heading text-lg font-semibold text-[#F8FAFC]">{title}</h3>
      <p className="mt-2.5 text-sm leading-relaxed text-[#94A3B8]">{description}</p>
    </div>
  );
}

/**
 * Three-step horizontal workflow explainer detailing district filtering, commission breakdown,
 * and confirmed goalkeeper booking.
 *
 * @param props - `HowItWorksSectionProps` containing localized step titles and descriptions.
 * @returns Rendered workflow `<section>` element.
 */
export function HowItWorksSection({ dictionary }: HowItWorksSectionProps): React.JSX.Element {
  return (
    <section id="how-it-works" className="border-b border-white/[0.06] bg-[#0B0F12] py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-8">
        <div>
          <span className="font-heading text-xs font-bold tracking-[0.12em] text-[#14E777] uppercase">
            02 // FLOW
          </span>
          <h2 className="mt-2 font-heading text-2xl font-bold tracking-[-0.02em] text-[#F8FAFC] sm:text-4xl">
            {dictionary.howItWorks.sectionTitle}
          </h2>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
          <WorkflowStepCard
            icon={MapPin}
            indexTag="STEP 01"
            title={dictionary.howItWorks.step1Title}
            description={dictionary.howItWorks.step1Desc}
          />
          <WorkflowStepCard
            icon={Calculator}
            indexTag="STEP 02"
            title={dictionary.howItWorks.step2Title}
            description={dictionary.howItWorks.step2Desc}
          />
          <WorkflowStepCard
            icon={Send}
            indexTag="STEP 03"
            title={dictionary.howItWorks.step3Title}
            description={dictionary.howItWorks.step3Desc}
          />
        </div>
      </div>
    </section>
  );
}
