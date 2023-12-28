import Head from "next/head";
import { useEffect, useState } from "react";
import { Card, Col, Container, Row, Table } from "react-bootstrap";

const DEFAULT_FILTERS = {
  category: ["All"],
};

export default function Home() {
  const [data, setData] = useState([]);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [filteredData, setFilteredData] = useState(data);
  const [selectedCategory, setSelectedCategory] = useState("All");

  useEffect(() => {
    let res = [];
    fetch("https://www.reddit.com/r/buildapcsales/hot.json?sort=new&limit=50")
      .then((res) => res.text())
      .then((result) => {
        try {
          console.log(JSON.parse(result).data.children);
          res = JSON.parse(result).data.children;
          res = res.filter((d) => !d.data.link_flair_text.includes("Expired"));
          setData(res);
          // Get distinct link_flair_text values
          const distinctLinkFlairText = [
            ...new Set(res.map((d) => d.data.link_flair_text)),
          ].sort();
          setFilters((prevFilters) => ({
            ...prevFilters,
            category: filters.category.concat(distinctLinkFlairText),
          }));
        } catch (error) {
          console.log(error);
        }
      });
  }, []);

  useEffect(() => {
    if(selectedCategory !== "All"){
      setFilteredData(
        data.filter((d) => d.data.link_flair_text === selectedCategory)
      );
    } else{
      setFilteredData(data);
    }
  },[data])
  useEffect(() => {
    if (selectedCategory === "All") {
      setFilteredData(data);
    } else {
      setFilteredData(
        data.filter((d) => d.data.link_flair_text === selectedCategory)
      );
    }
  }, [selectedCategory]);

  const returnURLHostname = (url) => {
    const tempURL = new URL(url);
    let domain = tempURL.hostname;
    domain = domain.split(".")[1];
    return domain;
  };

  return (
    <>
      <Head>
        <title>Build A PC Sale</title>
      </Head>
      <>
        <Container fluid>
          <h1>Build A PC Sale</h1>

          <Row>
            <Col lg={9}>
              <Table>
                <thead>
                  <tr>
                    <th style={{ width: "5%" }}>#</th>
                    <th style={{ width: "15%" }}>Category</th>
                    <th style={{ width: "75%" }}>Title</th>
                    <th style={{ width: "10%" }}>Link</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.map((d, i) => {
                    const domain = returnURLHostname(d.data.url);
                    return (
                      <tr key={i}>
                        <td>{i + 1}</td>
                        <td>{d.data.link_flair_text}</td>
                        <td>{d.data.title}</td>
                        <td>
                          <a href={d.data.url} target="_blank" rel="noreferrer">
                            {domain}
                          </a>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            </Col>
            <Col lg={3}>
              <Card>
                <Card.Body>
                  <Card.Title>Filters</Card.Title>
                  <Card.Text>
                    <div>
                      <select
                        value={selectedCategory}
                        onChange={(e) => {
                          setSelectedCategory(e.target.value);
                        }}
                      >
                        {filters.category.map((c, i) => (
                          <option key={i} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </>
    </>
  );
}
