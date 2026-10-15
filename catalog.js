'use strict';
// Shared catalog: one entry supplies each homepage card, lab navigation and settings.
const TOOLS = {
  "missing": {
    "repo": "HandiMissingDataEstimaor",
    "name": "Recover missing values",
    "short": "Missing-data estimation",
    "category": "DATA PREPARATION",
    "description": "Give incomplete data a second look. Explore PCA-based reconstruction and compare estimates against values deliberately hidden from the model.",
    "question": "Can the relationships between variables help recover measurements that are missing?",
    "example": "example_usage.py",
    "source": "PCAFill/pca_fill.py",
    "fields": [
      [
        "missing",
        "Values to hide",
        [
          [
            10,
            "10%"
          ],
          [
            20,
            "20%"
          ],
          [
            25,
            "25%"
          ]
        ],
        20,
        "A complete calibration block is retained."
      ],
      [
        "seed",
        "Example seed",
        [
          [
            42,
            "42 · default example"
          ],
          [
            7,
            "7 · alternative"
          ],
          [
            73,
            "73 · alternative"
          ]
        ],
        42,
        "Same synthetic construction, a different sample."
      ]
    ],
    "empty": "Compare hidden-value estimates with their known values and a simple mean-fill baseline.",
    "title": "Recover missing measurements",
    "summary": "Estimate blank cells using the relationships between variables. Compare reconstruction against known values in the example, or fill actual gaps in your own dataset.",
    "outcomes": "Missing-cell counts · before/after data · estimated values"
  },
  "ordering": {
    "repo": "SelectivePCA-Data-Reordering-Tool",
    "name": "Find the information in your variables",
    "short": "Variable ordering",
    "category": "DATA UNDERSTANDING",
    "description": "Explore which variables add information and which largely repeat what is already represented. Start with the exact dataset in the repository example.",
    "question": "How much of this dataset can a smaller set of variables represent?",
    "example": "example_usage.py",
    "source": "spca/spca.py",
    "fields": [
      [
        "keep",
        "Variables to retain",
        [
          [
            1,
            "1 variable"
          ],
          [
            2,
            "2 variables"
          ],
          [
            3,
            "3 variables"
          ],
          [
            4,
            "4 variables"
          ],
          [
            5,
            "All 5 variables"
          ]
        ],
        3,
        "Changes the retained prefix of the source’s computed order."
      ]
    ],
    "empty": "Inspect the variable ranking, incremental variance, and cumulative coverage.",
    "title": "Find which variables add information",
    "summary": "Explore a variance-based column ordering and see how much information a smaller selection represents. Run the original example or select columns from your own file.",
    "outcomes": "Variable ranking · incremental variance · cumulative coverage"
  },
  "propensity": {
    "repo": "AutoPropensity",
    "name": "Understand how actions were assigned",
    "short": "Propensity modeling",
    "category": "DECISION EVALUATION",
    "description": "Fit a propensity model and inspect the support for observed actions. Follow a bounded version of the repository’s tune → fit → score example.",
    "question": "Were observed actions plausible given the state, or supported by very little historical evidence?",
    "example": "usecase_basic.py",
    "source": "auto_propensity/builder.py",
    "fields": [
      [
        "samples",
        "Example observations",
        [
          [
            120,
            "120 observations"
          ],
          [
            200,
            "200 observations"
          ],
          [
            300,
            "300 observations"
          ]
        ],
        120,
        "4 state variables; a separate 25% held-out test set."
      ],
      [
        "action",
        "Action space",
        [
          [
            "discrete",
            "Discrete · 3 actions"
          ],
          [
            "continuous",
            "Continuous · 1 action"
          ]
        ],
        "discrete",
        "Parametric search only; no neural networks or nonparametric search."
      ]
    ],
    "empty": "See the distribution of held-out action scores and inspect the selected model configuration.",
    "title": "Examine support for historical actions",
    "summary": "Fit a bounded propensity-model search for discrete or continuous actions. Choose state variables and an action column, then inspect scores on held-out observations.",
    "outcomes": "Action scores · held-out log likelihood · fitted configuration"
  },
  "pca": {
    "repo": "pca_nipals",
    "name": "Look inside multivariate data",
    "short": "PCA exploration",
    "category": "MULTIVARIATE MODELING",
    "description": "Project several measurements into a smaller model space. Explore scores and the variation retained by your NIPALS PCA implementation.",
    "question": "What changes when several input variables are represented using only a few components?",
    "example": "example_usage.py",
    "source": "pca_nipals/pca.py",
    "fields": [
      [
        "components",
        "PCA components",
        [
          [
            1,
            "1 component"
          ],
          [
            2,
            "2 components"
          ],
          [
            3,
            "3 components"
          ]
        ],
        2,
        "30 calibration observations, 4 inputs, 10 test observations."
      ],
      [
        "seed",
        "Example seed",
        [
          [
            42,
            "42 · default example"
          ],
          [
            7,
            "7 · alternative"
          ],
          [
            73,
            "73 · alternative"
          ]
        ],
        42,
        "Reproducible synthetic observations."
      ]
    ],
    "empty": "Explore score-space structure, retained variance, and held-out reconstruction error.",
    "title": "Explore the structure in your data",
    "summary": "Use NIPALS PCA to represent multiple measurements with fewer components. Explore model scores, retained variation, and reconstruction on a held-out subset.",
    "outcomes": "Score plot · retained variance · reconstruction error"
  },
  "pls": {
    "repo": "pls_nipals",
    "name": "Connect measurements to outcomes",
    "short": "PLS prediction",
    "category": "SUPERVISED MODELING",
    "description": "Fit a NIPALS partial least squares model, then inspect its predictions on separate example observations.",
    "question": "How well can a compact model connect input measurements with an output of interest?",
    "example": "README.md",
    "source": "pls_nipals/pls.py",
    "fields": [
      [
        "components",
        "PLS components",
        [
          [
            1,
            "1 component"
          ],
          [
            2,
            "2 components"
          ],
          [
            3,
            "3 components"
          ]
        ],
        2,
        "30 calibration observations, 4 inputs and 2 outputs."
      ],
      [
        "seed",
        "Example seed",
        [
          [
            42,
            "42 · default example"
          ],
          [
            7,
            "7 · alternative"
          ],
          [
            73,
            "73 · alternative"
          ]
        ],
        42,
        "The README’s synthetic linear data construction."
      ]
    ],
    "empty": "Compare predicted and known held-out outputs, then inspect prediction residuals.",
    "title": "Connect measurements to outcomes",
    "summary": "Select input and output columns, fit a NIPALS PLS model, and examine predictions on held-out rows. Compare known outputs with predictions and inspect residuals.",
    "outcomes": "Observed vs. predicted · residuals · prediction error"
  },
  "clusters": {
    "repo": "KMeansPro",
    "name": "Explore groups in a dataset",
    "short": "Clustering",
    "category": "PATTERN EXPLORATION",
    "description": "Partition example observations using the repository’s K-means implementation. Explore the effect of cluster count and initialization repeats.",
    "question": "How does the grouping of the same observations change when the clustering settings change?",
    "example": "code_executor.py",
    "source": "kmeansPro.py",
    "fields": [
      [
        "clusters",
        "Requested clusters",
        [
          [
            2,
            "2 clusters"
          ],
          [
            3,
            "3 clusters"
          ],
          [
            4,
            "4 clusters"
          ]
        ],
        3,
        "60 synthetic observations in 2 dimensions."
      ],
      [
        "restarts",
        "Initialization repeats",
        [
          [
            3,
            "3 repeats"
          ],
          [
            5,
            "5 repeats"
          ],
          [
            10,
            "10 repeats"
          ]
        ],
        3,
        "Bounded repeat search using the original fitting routine."
      ]
    ],
    "empty": "See cluster membership, group sizes, and the source routine’s distance-to-center objective.",
    "title": "See how observations group together",
    "summary": "Change the number of clusters and initialization repeats. Group your own numeric observations and inspect memberships, sizes, and distances to cluster centers.",
    "outcomes": "Group visualization · membership counts · clustering objective"
  },
  "nullspace": {
    "repo": "NullSpaceExplorer",
    "name": "Find different inputs for the same target",
    "short": "Null-space exploration",
    "category": "MODEL INVERSION",
    "description": "Explore alternative input combinations that retain a desired output in a fitted model. Make a mathematical relationship visible.",
    "question": "Can different input settings lead to the same modeled outcome?",
    "example": "example_usage.py",
    "source": "nspls/null_space.py",
    "fields": [
      [
        "points",
        "Alternatives to display",
        [
          [
            10,
            "Up to 10 alternatives"
          ],
          [
            20,
            "Up to 20 alternatives"
          ],
          [
            30,
            "Up to 30 alternatives"
          ]
        ],
        20,
        "The source samples candidates internally; displayed results are capped."
      ],
      [
        "seed",
        "Example seed",
        [
          [
            42,
            "42 · default example"
          ],
          [
            7,
            "7 · alternative"
          ],
          [
            73,
            "73 · alternative"
          ]
        ],
        42,
        "30 calibration observations, 4 inputs, 2 outputs."
      ]
    ],
    "empty": "Inspect alternative input combinations and their deviations from the modeled target.",
    "title": "Find alternative inputs for a target",
    "summary": "Explore different inputs that preserve a fitted model’s output. For your own data, select input/output columns and enter the desired target values.",
    "outcomes": "Alternative inputs · modeled target deviations · result values"
  },
  "clusterpls": {
    "repo": "cluster-based-pls",
    "name": "Explore local predictive relationships",
    "short": "Cluster-based PLS",
    "category": "CLUSTERED REGRESSION",
    "description": "Combine input-space clustering with PLS models. Compare predictions against a single global model on the same synthetic test observations.",
    "question": "What changes when observations are modeled in groups rather than with one global relationship?",
    "example": "CB_pls_executer.py",
    "source": "CB_PLS.py",
    "fields": [
      [
        "clusters",
        "Requested input clusters",
        [
          [
            1,
            "1 · global model"
          ],
          [
            2,
            "2 input clusters"
          ],
          [
            3,
            "3 input clusters"
          ]
        ],
        2,
        "60 calibration observations, 3 inputs and 3 outputs."
      ],
      [
        "seed",
        "Example seed",
        [
          [
            42,
            "42 · default example"
          ],
          [
            7,
            "7 · alternative"
          ],
          [
            73,
            "73 · alternative"
          ]
        ],
        42,
        "3 initialization repeats; the source may reduce cluster count."
      ]
    ],
    "empty": "Compare held-out predictions from clustered and single-model PLS. This is a code example, not a replay of the published microgel study.",
    "title": "Explore local predictive relationships",
    "summary": "Group inputs and fit PLS models within those groups. Try the repository example or fit the original method to selected inputs and outputs from your file.",
    "outcomes": "Held-out predictions · original implementation · research link",
    "paper": {
      "url": "https://scholar.google.ca/citations?view_op=view_citation&hl=en&user=KbM2tm4AAAAJ&citation_for_view=KbM2tm4AAAAJ:d1gkVwhDpl0C",
      "label": "Related research · 2022 microgel paper ↗"
    }
  }
};
const LAB_LIMITS = Object.freeze({rows:1000,columns:20,fileBytes:2*1024*1024});
