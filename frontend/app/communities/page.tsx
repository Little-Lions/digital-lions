'use client'

import React, { useState, useEffect } from "react";
import TextInput from "@/components/TextInput";
import CustomButton from "@/components/CustomButton";
import getCommunities from "@/api/services/communities/getCommunities";
import createCommunity from "@/api/services/communities/createCommunity";
import LinkCard from "@/components/LinkCard";
import Modal from "@/components/Modal";
import SkeletonLoader from "@/components/SkeletonLoader";
interface Community {
  name: string;
  id: number;
}

const CommunityPage: React.FC = () => {
  const [communityName, setCommunityName] = useState("");
  const [communities, setCommunities] = useState<Community[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAddingCommunity, setIsAddingCommunity] = useState(false);
  const [openAddCommunityModal, setOpenAddCommunityModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const fetchCommunities = async () => {
    setIsLoading(true);
    try {
      const communitiesData = await getCommunities();
      setCommunities(communitiesData);
    } catch (error) {
      console.error("Failed to fetch communities:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCommunities();
  }, []);

  const handleOpenCommunityModal = () => {
    setOpenAddCommunityModal(true);
  };

  const handleCloseCommunityModal = () => {
    setOpenAddCommunityModal(false);
  };

  const handleCommunityNameChange = (value: string) => {
    setCommunityName(value);
  };

  const handleCommunityNameBlur = (value: string) => {
    setCommunityName(value);
  };

  const handleAddCommunity = async () => {
    if (communityName.trim() === "") return;
    setIsAddingCommunity(true);
    try {
      const newCommunity = await createCommunity(communityName);
      setCommunities([...communities, newCommunity]);
      setCommunityName("");
      setIsAddingCommunity(false);
      setOpenAddCommunityModal(false);
      fetchCommunities();
    } catch (error) {
      setIsAddingCommunity(false);
      setErrorMessage(String(error));
      console.error("Error adding community:", error);
    }
  };

  return (
    <>
      {isLoading ? (
        <>
          <SkeletonLoader width="142px" type="button" />
          {Array.from({ length: 8 }, (_, i) => (
            <SkeletonLoader key={i} type="card" />
          ))}
        </>
      ) : (
        <>
          <CustomButton
            label="Add Community"
            onClick={handleOpenCommunityModal}
            variant="primary"
            className="hover:bg-card-dark hover:text-white mb-4"
          />
          {communities.map((community) => (
            <LinkCard
              key={community.id}
              title={community.name}
              href={`/communities/${community.id}/teams`}
              state={{ communityName: community.name }}
              className="mb-2"
            />
          ))}
          {openAddCommunityModal && (
            <Modal
              onClose={handleCloseCommunityModal}
              title="Add Community"
              acceptText="Add"
              onAccept={handleAddCommunity}
              isBusy={isAddingCommunity}
              isDisabledButton={!communityName}
            >
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleAddCommunity();
                }}
              >
                <TextInput
                  className="mb-2"
                  label="Community name"
                  value={communityName}
                  onChange={handleCommunityNameChange}
                  onBlur={handleCommunityNameBlur}
                  autoFocus
                />
                {errorMessage && <p className="text-error">{errorMessage}</p>}
              </form>
            </Modal>
          )}
        </>
      )}
    </>
  );
};

export default CommunityPage;
