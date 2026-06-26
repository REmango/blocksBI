import chartComponent from './common/chartContainer'
import DividerWidget from './common/widget/DividerWidget'
import InputWidget from './common/widget/InputWidget'
import RadioWidget from './common/widget/RadioWidget'
import RateWidget from './common/widget/RateWidget'
import ProgressWidget from './common/widget/ProgressWidget'
import TagWidget from './common/widget/TagWidget'

const componentMap = {
  chart: chartComponent,
  divider: DividerWidget,
  input: InputWidget,
  radio: RadioWidget,
  rate: RateWidget,
  progress: ProgressWidget,
  tag: TagWidget,
}

export { componentMap }
