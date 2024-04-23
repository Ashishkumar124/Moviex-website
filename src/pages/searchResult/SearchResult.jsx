import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import InfiniteScroll from "react-infinite-scroll-component";

import "./style.scss";

import { fetchDataFromApi } from "../../utils/api";
import ContentWrapper from "../../components/contentWrapper/ContentWrapper";
import MovieCard from "../../components/movieCard/MovieCard";
import Spinner from "../../components/spinner/Spinner";
import noResultsImage from "../../assets/no-results.png";

const SearchResult = () => {
    const [data, setData] = useState(null);
    const [pageNum, setPageNum] = useState(1);
    const [loading, setLoading] = useState(false);
    const { query } = useParams();

    const fetchInitialData = async () => {
        setLoading(true);
        try {
            const response = await fetchDataFromApi(`/search/multi?query=${query}&page=${pageNum}`);
            setData(response);
            setPageNum(prevPageNum => prevPageNum + 1);
        } catch (error) {
            console.error("Error fetching initial data:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchNextPageData = async () => {
        try {
            const response = await fetchDataFromApi(`/search/multi?query=${query}&page=${pageNum}`);
            setData(prevData => ({
                ...prevData,
                results: [...prevData.results, ...response.results],
            }));
            setPageNum(prevPageNum => prevPageNum + 1);
        } catch (error) {
            console.error("Error fetching next page data:", error);
        }
    };

    useEffect(() => {
        setPageNum(1);
        fetchInitialData();
    }, [query]);

    return (
        <div className="searchResultsPage">
            {loading && <Spinner initial={true} />}
            {!loading && (
                <ContentWrapper>
                    {data && data.results && data.results.length > 0 ? (
                        <>
                            <div className="pageTitle">
                                {`Search ${data.total_results > 1 ? "results" : "result"} of '${query}'`}
                            </div>
                            <InfiniteScroll
                                className="content"
                                dataLength={data.results.length}
                                next={fetchNextPageData}
                                hasMore={pageNum <= data.total_pages}
                                loader={<Spinner />}
                            >
                                {data.results.map((item, index) => (
                                    <MovieCard
                                        key={index}
                                        data={item}
                                        fromSearch={true}
                                    />
                                ))}
                            </InfiniteScroll>
                        </>
                    ) : (
                        <span className="resultNotFound">
                            <img src={noResultsImage} alt="No results found" />
                            Sorry, no results found!
                        </span>
                    )}
                </ContentWrapper>
            )}
        </div>
    );
};

export default SearchResult;
