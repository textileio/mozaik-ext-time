import React, { Component } from 'react'
import PropTypes from 'prop-types'
import moment from 'moment'
import 'moment-timezone/builds/moment-timezone-with-data'
import styled from 'styled-components'
import Measure from 'react-measure'
import { Widget, WidgetHeader } from '@mozaik/ui'
import DayIcon from 'react-icons/lib/fa/sun-o'
import NightIcon from 'react-icons/lib/fa/moon-o'
import DigitalClockDate from './DigitalClockDate'
import DigitalClockTime from './DigitalClockTime'

const Container = styled.div`
    padding: 3vmin;
    width: 80%;
    height: 80%;
`

const innerContainerStyle = {
    width: '100%',
    height: '100%',
    flex: 1,
    flexDirection: 'column',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
}

const getDate = time => {
    const iso = time || 0
    let timezone = moment(iso)._tzm || 0
    return moment.utc(iso).add(timezone, 'minutes')
}

const sunFormats = ['HH:mm', 'H:mm', 'H:m']

export default class DigitalClock extends Component {
    static propTypes = {
        apiData: PropTypes.shape({
            time: PropTypes.string,
        }),
        sunRise: PropTypes.string.isRequired,
        sunSet: PropTypes.string.isRequired,
        displayDate: PropTypes.bool.isRequired,
        displaySeconds: PropTypes.bool.isRequired,
        color: PropTypes.string,
        theme: PropTypes.object.isRequired,
    }

    static defaultProps = {
        displayDate: true,
        displaySeconds: true,
        sunRise: '06:00',
        sunSet: '18:00',
    }

    static getApiRequest() {
        return { id: 'loom.time' }
    }

    state = {
        date: getDate(),
        dimensions: {
            width: -1,
            height: -1,
        },
    }

    constructor(props) {
        super(props)

        this.state = {
            date: getDate((props.apiData || {}).time),
            dimensions: {
                width: -1,
                height: -1,
            },
        }
    }

    componentDidMount() {
        setInterval(() => {
            this.setState({ date: getDate((this.props.apiData || {}).time) })
        }, 1000)
    }

    render() {
        const { sunRise, sunSet, displayDate, displaySeconds, color: _color, theme } = this.props
        const { date, dimensions: { width, height } } = this.state

        const color = _color || theme.root.color

        const shouldRender = width > 0 && height > 0
        const shouldRenderDate = shouldRender && displayDate

        const sunRiseTime = moment.utc(sunRise, sunFormats)
        const sunSetTime = moment.utc(sunSet, sunFormats)

        const sunRiseDate = date.clone().hours(sunRiseTime.hours()).minutes(sunRiseTime.minutes())
        const sunSetDate = date.clone().hours(sunSetTime.hours()).minutes(sunSetTime.minutes())

        const isDay = date.isBetween(sunRiseDate, sunSetDate)
        const dayNightIcon = isDay ? <DayIcon /> : <NightIcon />

        return (
            <Widget>
                <WidgetHeader
                    title={<span>Current Time</span>}
                    subject={'tz: ' + date._tzm || 0}
                    subjectPlacement="append"
                    icon={dayNightIcon}
                />
                <Container>
                    <Measure
                        onResize={contentRect => {
                            this.setState({ dimensions: contentRect.entry })
                        }}
                    >
                        {({ measureRef }) =>
                            <div ref={measureRef} style={innerContainerStyle}>
                                {shouldRenderDate &&
                                    <DigitalClockDate date={date} width={width} color={color} />}
                                {shouldRender &&
                                    <DigitalClockTime
                                        date={date}
                                        displaySeconds={displaySeconds}
                                        width={width}
                                        color={color}
                                    />}
                            </div>}
                    </Measure>
                </Container>
            </Widget>
        )
    }
}
