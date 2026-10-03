import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts'
import { useStore } from '../store/useStore'

interface Factor {
  feature: string
  feature_label: string
  value: number
  shap_importance: number
  direction: string
}

interface Props {
  factors: Factor[]
}

const translations: Record<
  string,
  {
    title: string
    why: string
    meaning: string
    unavailable: string
    legend: string

    positiveIntro: string
    positiveOnly: string
    negativeIntro: string
    negativeOnly: string
    overall: string

    meaningText: string
  }
> = {
  en: {
    title: 'Why this crop? (SHAP Explanation)',
    why: 'Why?',
    meaning: 'What does this mean?',
    unavailable: 'SHAP explanation is not available for this prediction.',
    legend: 'Green = factor favors this crop · Red = factor against',

    positiveIntro:
      'The prediction was mainly supported by',
    positiveOnly:
      'These factors contributed positively toward the predicted crop.',
    negativeIntro:
      'The following factors contributed in the opposite direction:',
    negativeOnly:
      'These factors moved the prediction slightly away from the predicted crop.',
    overall:
      'Overall, the supporting factors had a stronger influence on this prediction.',

    meaningText:
      'SHAP explains how each soil and environmental factor contributed to this particular crop prediction. A positive contribution supports the prediction, while a negative contribution works against it. The size of the contribution shows how strongly that factor influenced the model for this prediction. It does not mean that one factor alone determines the crop.'
  },

  hi: {
    title: 'यह फसल क्यों? (SHAP व्याख्या)',
    why: 'क्यों?',
    meaning: 'इसका क्या मतलब है?',
    unavailable: 'इस अनुमान के लिए SHAP व्याख्या उपलब्ध नहीं है।',
    legend: 'हरा = इस फसल के पक्ष में प्रभाव · लाल = इस फसल के विरुद्ध प्रभाव',

    positiveIntro:
      'इस अनुमान को मुख्य रूप से इन कारकों का समर्थन मिला:',
    positiveOnly:
      'इन कारकों ने अनुमानित फसल के पक्ष में सकारात्मक योगदान दिया।',
    negativeIntro:
      'इन कारकों ने विपरीत दिशा में योगदान दिया:',
    negativeOnly:
      'इन कारकों ने अनुमान को अनुमानित फसल से थोड़ा दूर किया।',
    overall:
      'कुल मिलाकर, समर्थन करने वाले कारकों का प्रभाव इस अनुमान में अधिक रहा।',

    meaningText:
      'SHAP बताता है कि मिट्टी और पर्यावरण का प्रत्येक कारक इस विशेष फसल के अनुमान में कितना योगदान देता है। सकारात्मक योगदान अनुमान का समर्थन करता है, जबकि नकारात्मक योगदान उसके विरुद्ध होता है। योगदान का आकार बताता है कि उस कारक ने इस अनुमान को कितनी मजबूती से प्रभावित किया। इसका मतलब यह नहीं है कि केवल एक कारक ही फसल निर्धारित करता है।'
  },

  te: {
    title: 'ఈ పంటను ఎందుకు ఎంచుకున్నారు? (SHAP వివరణ)',
    why: 'ఎందుకు?',
    meaning: 'దీని అర్థం ఏమిటి?',
    unavailable: 'ఈ అంచనాకు SHAP వివరణ అందుబాటులో లేదు.',
    legend: 'ఆకుపచ్చ = ఈ పంటకు అనుకూల ప్రభావం · ఎరుపు = ఈ పంటకు వ్యతిరేక ప్రభావం',

    positiveIntro:
      'ఈ అంచనాకు ప్రధానంగా ఈ అంశాలు మద్దతు ఇచ్చాయి:',
    positiveOnly:
      'ఈ అంశాలు అంచనా వేసిన పంటకు అనుకూలంగా సానుకూల ప్రభావాన్ని చూపించాయి.',
    negativeIntro:
      'ఈ అంశాలు అంచనాపై వ్యతిరేక దిశలో ప్రభావం చూపించాయి:',
    negativeOnly:
      'ఈ అంశాలు అంచనాను ఎంచుకున్న పంటకు కొంత వ్యతిరేకంగా ప్రభావితం చేశాయి.',
    overall:
      'మొత్తంగా, ఈ అంచనాలో మద్దతు ఇచ్చిన అంశాల ప్రభావం ఎక్కువగా ఉంది.',

    meaningText:
      'SHAP ద్వారా నేల మరియు పర్యావరణంలోని ప్రతి అంశం ఈ ప్రత్యేక పంట అంచనాకు ఎంతవరకు సహకరించిందో తెలుస్తుంది. అనుకూల ప్రభావం అంచనాకు మద్దతు ఇస్తుంది, ప్రతికూల ప్రభావం అంచనాకు వ్యతిరేకంగా పనిచేస్తుంది. ప్రభావం పరిమాణం ఆ అంశం ఈ అంచనాను ఎంత బలంగా ప్రభావితం చేసిందో చూపిస్తుంది. ఒక్క అంశం మాత్రమే పంటను నిర్ణయిస్తుందని దీని అర్థం కాదు.'
  },

  mr: {
    title: 'हे पीक का? (SHAP स्पष्टीकरण)',
    why: 'का?',
    meaning: 'याचा अर्थ काय?',
    unavailable: 'या अंदाजासाठी SHAP स्पष्टीकरण उपलब्ध नाही.',
    legend: 'हिरवा = या पिकाला अनुकूल प्रभाव · लाल = या पिकाच्या विरुद्ध प्रभाव',

    positiveIntro:
      'या अंदाजाला मुख्यतः या घटकांचा आधार मिळाला:',
    positiveOnly:
      'या घटकांनी अंदाज केलेल्या पिकाच्या दिशेने सकारात्मक योगदान दिले.',
    negativeIntro:
      'या घटकांनी अंदाजावर विरुद्ध दिशेने प्रभाव टाकला:',
    negativeOnly:
      'या घटकांनी अंदाजाला निवडलेल्या पिकापासून थोडे दूर नेले.',
    overall:
      'एकूणच, या अंदाजामध्ये समर्थन करणाऱ्या घटकांचा प्रभाव अधिक होता.',

    meaningText:
      'SHAP हे दर्शवते की माती आणि पर्यावरणातील प्रत्येक घटकाने या विशिष्ट पिकाच्या अंदाजात किती योगदान दिले. सकारात्मक योगदान अंदाजाला समर्थन देते, तर नकारात्मक योगदान त्याच्या विरुद्ध कार्य करते. योगदानाचा आकार त्या घटकाने या अंदाजावर किती प्रभाव टाकला हे दर्शवतो. याचा अर्थ असा नाही की केवळ एकच घटक पीक निश्चित करतो.'
  }
}

export default function ShapCard({ factors }: Props) {
  const { language } = useStore()

  const text = translations[language] || translations.en

  /*
   * Check whether SHAP data is actually available.
   * A SHAP value of 0 is still valid, so we should not
   * use "!factors[0]?.shap_importance" here.
   */
  if (
    !factors ||
    factors.length === 0 ||
    factors.every(
      f =>
        f.shap_importance === undefined ||
        f.shap_importance === null
    )
  ) {
    return (
      <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">
          {text.title}
        </h3>

        <p className="text-xs text-gray-500">
          {text.unavailable}
        </p>
      </div>
    )
  }

  /*
   * Prepare chart data.
   *
   * SHAP magnitude is used for bar length.
   * Direction is kept separately for the green/red color.
   */
  const data = factors
    .map(f => ({
      name: f.feature_label,
      importance: Math.abs(
        parseFloat((f.shap_importance ?? 0).toFixed(3))
      ),
      direction: f.direction,
      value: f.value
    }))
    .sort((a, b) => b.importance - a.importance)

  /*
   * Positive and negative contributors.
   */
  const positiveFactors = data
    .filter(f => f.direction === 'positive' && f.importance > 0)
    .sort((a, b) => b.importance - a.importance)

  const negativeFactors = data
    .filter(f => f.direction !== 'positive' && f.importance > 0)
    .sort((a, b) => b.importance - a.importance)

  /*
   * We don't want the explanation to become extremely long.
   * Show the strongest contributors while still mentioning
   * the important factors.
   */
  const topPositive = positiveFactors.slice(0, 3)
  const topNegative = negativeFactors.slice(0, 2)

  /*
   * Build a readable list of feature names.
   *
   * Example:
   * Rainfall, Nitrogen and Potassium
   */
  const formatFeatureList = (
    items: typeof data
  ) => {
    const names = items.map(item => item.name)

    if (names.length === 0) return ''

    if (names.length === 1) {
      return names[0]
    }

    if (names.length === 2) {
      return `${names[0]} and ${names[1]}`
    }

    return `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`
  }

  /*
   * Build the multilingual WHY explanation.
   */
  const buildWhyExplanation = () => {
    if (
      topPositive.length === 0 &&
      topNegative.length === 0
    ) {
      return text.unavailable
    }

    /*
     * ENGLISH
     */
    if (language === 'en') {
      let explanation = ''

      if (topPositive.length > 0) {
        const positiveNames = formatFeatureList(topPositive)

        explanation += `${text.positiveIntro} ${positiveNames}. `

        if (topPositive.length === 1) {
          explanation +=
            `${positiveNames} ${text.positiveOnly} `
        } else {
          explanation +=
            `${positiveNames} ${text.positiveOnly} `
        }
      }

      if (topNegative.length > 0) {
        const negativeNames = formatFeatureList(topNegative)

        explanation += `${text.negativeIntro} ${negativeNames}. `

        explanation += text.negativeOnly + ' '
      }

      if (topPositive.length > 0 && topNegative.length > 0) {
        explanation += text.overall
      }

      return explanation.trim()
    }

    /*
     * HINDI
     */
    if (language === 'hi') {
      let explanation = ''

      if (topPositive.length > 0) {
        const positiveNames = formatFeatureList(topPositive)

        explanation += `${text.positiveIntro} ${positiveNames}। `

        explanation +=
          `${positiveNames} ने अनुमानित फसल के पक्ष में सकारात्मक प्रभाव डाला। `
      }

      if (topNegative.length > 0) {
        const negativeNames = formatFeatureList(topNegative)

        explanation += `${text.negativeIntro} ${negativeNames}। `

        explanation +=
          'इन कारकों ने अनुमान को चुनी गई फसल की दिशा से थोड़ा दूर किया। '
      }

      if (topPositive.length > 0 && topNegative.length > 0) {
        explanation += text.overall
      }

      return explanation.trim()
    }

    /*
     * TELUGU
     */
    if (language === 'te') {
      let explanation = ''

      if (topPositive.length > 0) {
        const positiveNames = formatFeatureList(topPositive)

        explanation += `${text.positiveIntro} ${positiveNames}. `

        explanation +=
          `${positiveNames} అంచనా వేసిన పంటకు అనుకూలంగా సానుకూల ప్రభావాన్ని చూపించాయి. `
      }

      if (topNegative.length > 0) {
        const negativeNames = formatFeatureList(topNegative)

        explanation += `${text.negativeIntro} ${negativeNames}. `

        explanation +=
          'ఈ అంశాలు అంచనాను ఎంచుకున్న పంటకు కొంత వ్యతిరేకంగా ప్రభావితం చేశాయి. '
      }

      if (topPositive.length > 0 && topNegative.length > 0) {
        explanation += text.overall
      }

      return explanation.trim()
    }

    /*
     * MARATHI
     */
    if (language === 'mr') {
      let explanation = ''

      if (topPositive.length > 0) {
        const positiveNames = formatFeatureList(topPositive)

        explanation += `${text.positiveIntro} ${positiveNames}. `

        explanation +=
          `${positiveNames} यांनी अंदाज केलेल्या पिकाच्या दिशेने सकारात्मक प्रभाव टाकला. `
      }

      if (topNegative.length > 0) {
        const negativeNames = formatFeatureList(topNegative)

        explanation += `${text.negativeIntro} ${negativeNames}. `

        explanation +=
          'या घटकांनी अंदाजाला निवडलेल्या पिकापासून थोडे दूर नेले. '
      }

      if (topPositive.length > 0 && topNegative.length > 0) {
        explanation += text.overall
      }

      return explanation.trim()
    }

    return text.unavailable
  }

  const whyExplanation = buildWhyExplanation()

  return (
    <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">

      {/* Title */}
      <h3 className="text-sm font-semibold text-gray-700 mb-3">
        {text.title}
      </h3>

      {/* SHAP Chart */}
      <ResponsiveContainer width="100%" height={140}>
        <BarChart
          data={data}
          layout="vertical"
          margin={{
            left: 80,
            right: 20
          }}
        >
          <XAxis
            type="number"
            tick={{ fontSize: 11 }}
          />

          <YAxis
            type="category"
            dataKey="name"
            tick={{ fontSize: 11 }}
            width={80}
          />

          <Tooltip
            formatter={(v: any, n: any, p: any) => [
              `${v} (value: ${p.payload.value})`,
              'SHAP'
            ]}
          />

          <Bar
            dataKey="importance"
            radius={[0, 4, 4, 0]}
          >
            {data.map((d, i) => (
              <Cell
                key={i}
                fill={
                  d.direction === 'positive'
                    ? '#16a34a'
                    : '#dc2626'
                }
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Legend */}
      <p className="text-xs text-gray-500 mt-1">
        {text.legend}
      </p>

      {/* WHY EXPLANATION */}
      <div className="mt-4 bg-white rounded-lg border border-gray-100 p-3">
        <h4 className="text-sm font-semibold text-gray-800 mb-2">
          🔍 {text.why}
        </h4>

        <p className="text-xs text-gray-600 leading-relaxed">
          {whyExplanation}
        </p>

        {/* Show the actual strongest contributors */}
        {topPositive.length > 0 && (
          <div className="mt-3">
            <p className="text-[11px] font-medium text-green-700 mb-1">
              🟢 {formatFeatureList(topPositive)}
            </p>

            <div className="space-y-1">
              {topPositive.map((factor, index) => (
                <div
                  key={`positive-${index}`}
                  className="flex items-center justify-between text-[11px] text-gray-500"
                >
                  <span>{factor.name}</span>
                  <span className="text-green-600 font-medium">
                    +{factor.importance}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {topNegative.length > 0 && (
          <div className="mt-3">
            <p className="text-[11px] font-medium text-red-700 mb-1">
              🔴 {formatFeatureList(topNegative)}
            </p>

            <div className="space-y-1">
              {topNegative.map((factor, index) => (
                <div
                  key={`negative-${index}`}
                  className="flex items-center justify-between text-[11px] text-gray-500"
                >
                  <span>{factor.name}</span>
                  <span className="text-red-600 font-medium">
                    -{factor.importance}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* WHAT DOES THIS MEAN */}
      <div className="mt-2 bg-green-50 rounded-lg border border-green-100 p-3">
        <h4 className="text-sm font-semibold text-green-800 mb-1">
          💡 {text.meaning}
        </h4>

        <p className="text-xs text-green-700 leading-relaxed">
          {text.meaningText}
        </p>
      </div>

    </div>
  )
}