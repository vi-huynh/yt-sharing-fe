import { Row, Col, Typography, Space } from "antd"
import { ILink } from "../../type"
import htmlParser from "html-react-parser"
import { YOUTBUE_EMBED_URL } from "../../services/api"

const { Paragraph, Text, Title } = Typography

interface ITimeLineItemProps {
  link: ILink
}

const TimeLineItem = ({ link }: ITimeLineItemProps) => {
  return (
    <Row>
      <Col span={7}>
        <iframe title={`movie-${link.id}`} className="youtube-video" src={`${YOUTBUE_EMBED_URL}${link.video_id}`}></iframe>
      </Col>
      <Col span={1}></Col>
      <Col span={16}>
        <Space direction="vertical" size={2}>
          <Title type="danger" level={4}>
            {link.title}
          </Title>
          <Text>
            Share By
            <Title level={5} style={{ marginLeft: "10px", fontSize: "14px" }}>{link.shared_by}</Title>
          </Text>
          <Text className="tl-description">
            Description
            <Paragraph style={{ marginLeft: "10px", fontSize: "14px", fontWeight: "bold" }} className="tl-description-scrollable" ellipsis={{ rows: 15, expandable: true, symbol: 'more' }}>
              {htmlParser(link.description)}
            </Paragraph>
          </Text>
        </Space>
      </Col>
    </Row>
  )
}

export default TimeLineItem
