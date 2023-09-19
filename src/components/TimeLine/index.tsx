import { Timeline } from "antd"
import { ILink } from "../../type"
import TimeLineItem from "./TimeLineItem"

interface ITimeLineProps {
  links: ILink[]
}

const Index = ({ links }: ITimeLineProps) => {
  return (
    <Timeline items=
      {[...links.map((link) =>
        ({ children: <TimeLineItem key={link.id} link={link} /> })
      ), { children: "" }]}
      pending="Loading..."
    />
  )
}

export default Index
