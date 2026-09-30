/**
 * Research behind the concepts TrustLab measures, in MLA 9 format. Every entry was checked
 * against its publisher record (DOI). The site does not reproduce these studies.
 */
export type Source = {
  authors: string;
  /** Includes its own closing punctuation, as MLA places it inside the quotation marks. */
  title: string;
  /** Journal or proceedings, shown in italics. */
  container: string;
  details: string;
  doi: string;
};

export const SOURCES: Source[] = [
  {
    authors: 'Bansal, Gagan, et al.',
    title: 'Does the Whole Exceed Its Parts? The Effect of AI Explanations on Complementary Team Performance.',
    container: 'Proceedings of the 2021 CHI Conference on Human Factors in Computing Systems',
    details: 'Association for Computing Machinery, 2021',
    doi: '10.1145/3411764.3445717',
  },
  {
    authors: 'Buçinca, Zana, et al.',
    title: 'To Trust or to Think: Cognitive Forcing Functions Can Reduce Overreliance on AI in AI-Assisted Decision-Making.',
    container: 'Proceedings of the ACM on Human-Computer Interaction',
    details: 'vol. 5, no. CSCW1, 2021, article 188',
    doi: '10.1145/3449287',
  },
  {
    authors: 'Dietvorst, Berkeley J., et al.',
    title: 'Algorithm Aversion: People Erroneously Avoid Algorithms after Seeing Them Err.',
    container: 'Journal of Experimental Psychology: General',
    details: 'vol. 144, no. 1, 2015, pp. 114–26',
    doi: '10.1037/xge0000033',
  },
  {
    authors: 'Lee, John D., and Katrina A. See.',
    title: 'Trust in Automation: Designing for Appropriate Reliance.',
    container: 'Human Factors',
    details: 'vol. 46, no. 1, 2004, pp. 50–80',
    doi: '10.1518/hfes.46.1.50_30392',
  },
  {
    authors: 'Parasuraman, Raja, and Victor Riley.',
    title: 'Humans and Automation: Use, Misuse, Disuse, Abuse.',
    container: 'Human Factors',
    details: 'vol. 39, no. 2, 1997, pp. 230–53',
    doi: '10.1518/001872097778543886',
  },
  {
    authors: 'Schemmer, Max, et al.',
    title: 'Appropriate Reliance on AI Advice: Conceptualization and the Effect of Explanations.',
    container: 'Proceedings of the 28th International Conference on Intelligent User Interfaces',
    details: 'Association for Computing Machinery, 2023, pp. 410–22',
    doi: '10.1145/3581641.3584066',
  },
  {
    authors: 'Skitka, Linda J., et al.',
    title: 'Does Automation Bias Decision-Making?',
    container: 'International Journal of Human-Computer Studies',
    details: 'vol. 51, no. 5, 1999, pp. 991–1006',
    doi: '10.1006/ijhc.1999.0252',
  },
  {
    authors: 'Zhang, Yunfeng, et al.',
    title: 'Effect of Confidence and Explanation on Accuracy and Trust Calibration in AI-Assisted Decision Making.',
    container: 'Proceedings of the 2020 Conference on Fairness, Accountability, and Transparency',
    details: 'Association for Computing Machinery, 2020, pp. 295–305',
    doi: '10.1145/3351095.3372852',
  },
];
