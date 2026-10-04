// ========================================
// ER123 - 메인 스크립트
// ========================================

let currentTeams = [];


// ========================================
// 전체 사람 목록
// ========================================

async function loadPeople() {
  const { data, error } = await supabaseClient
    .from("people")
    .select("*")
    .order("id", { ascending: true });

  if (error) {
    console.error(error);
    return;
  }

  const peopleList = document.getElementById("peopleList");

  if (!peopleList) return;

  peopleList.innerHTML = "";

  ["팀장", "팀원", "뉴비"].forEach(function(tier) {
    const tierSection = document.createElement("div");
    tierSection.className = "tier-section";

    const title = document.createElement("h2");
    title.className = "tier-title tier-title-" + tier;
    title.textContent = "● " + tier;

    tierSection.appendChild(title);

    const grid = document.createElement("div");
    grid.className = "people-grid";

    const tierPeople = data.filter(function(person) {
      return person.tier === tier;
    });

    if (tierPeople.length === 0) {
      const empty = document.createElement("div");
      empty.className = "empty-tier";
      empty.textContent = "아직 사람이 없습니다.";

      grid.appendChild(empty);
    } else {
      tierPeople.forEach(function(person) {
        grid.appendChild(createPersonCard(person));
      });
    }

    tierSection.appendChild(grid);
    peopleList.appendChild(tierSection);
  });
}


// ========================================
// 사람 카드
// ========================================

function createPersonCard(person) {
  const card = document.createElement("div");
  card.className = "person";

  const image = document.createElement("img");

  image.src = person.profile_image
    ? person.profile_image
    : "https://ui-avatars.com/api/?name=" +
      encodeURIComponent(person.name) +
      "&background=334155&color=ffffff&size=160";

  image.alt = person.name;

  image.style.width = "70px";
  image.style.height = "70px";
  image.style.borderRadius = "50%";
  image.style.objectFit = "cover";
  image.style.marginBottom = "8px";

  card.appendChild(image);

  const name = document.createElement("div");

  name.className = "person-name";
  name.textContent = person.name;
  name.style.textAlign = "center";
  name.style.width = "100%";

  card.appendChild(name);

  if (person.nickname) {
    const nickname = document.createElement("div");

    nickname.textContent = "@" + person.nickname;
    nickname.style.fontSize = "13px";
    nickname.style.color = "#94a3b8";
    nickname.style.marginTop = "3px";

    card.appendChild(nickname);
  }

  if (person.description) {
    const description = document.createElement("div");

    description.textContent = person.description;
    description.style.fontSize = "12px";
    description.style.color = "#cbd5e1";
    description.style.marginTop = "5px";
    description.style.textAlign = "center";

    card.appendChild(description);
  }

  return card;
}


// ========================================
// 사람 검색
// ========================================

async function searchPerson() {
  const searchInput = document.getElementById("searchInput");
  const result = document.getElementById("result");

  if (!searchInput || !result) return;

  const name = searchInput.value.trim();

  if (!name) {
    result.innerHTML = "";
    return;
  }

  const { data, error } = await supabaseClient
    .from("people")
    .select("*")
    .ilike("name", "%" + name + "%");

  if (error) {
    console.error(error);

    result.innerHTML = "오류가 발생했습니다.";

    return;
  }

  if (!data || data.length === 0) {
    result.innerHTML =
      '<div class="no-result">없음</div>';

    return;
  }

  result.innerHTML = data.map(function(person) {
    return (
      '<div class="person">' +
        "<span>" + person.name + "</span>" +
        '<span class="tier tier-' + person.tier + '">' +
          person.tier +
        "</span>" +
      "</div>"
    );
  }).join("");
}


// ========================================
// 사람 추가
// ========================================

async function addPerson() {
  const nameInput = document.getElementById("nameInput");
  const tierInput = document.getElementById("tierInput");

  if (!nameInput || !tierInput) return;

  const name = nameInput.value.trim();
  const tier = tierInput.value;

  if (!name) {
    alert("사람 이름을 입력해주세요.");
    return;
  }

  const { error } = await supabaseClient
    .from("people")
    .insert([
      {
        name: name,
        tier: tier,
        nickname: "",
        profile_image: "",
        description: ""
      }
    ]);

  if (error) {
    console.error(error);

    alert("추가에 실패했습니다.");

    return;
  }

  alert("사람이 추가되었습니다.");

  nameInput.value = "";

  loadPeople();
  loadProfiles();
  loadParticipants();
}


// ========================================
// 프로필 수정창
// ========================================

function openEditModal(person) {
  const oldModal =
    document.getElementById("profileEditModal");

  if (oldModal) {
    oldModal.remove();
  }

  const modal = document.createElement("div");

  modal.id = "profileEditModal";

  Object.assign(modal.style, {
    position: "fixed",
    left: "0",
    top: "0",
    width: "100%",
    height: "100%",
    background: "rgba(0,0,0,0.7)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: "9999"
  });

  const box = document.createElement("div");

  Object.assign(box.style, {
    width: "min(450px, 90%)",
    background: "#1e293b",
    borderRadius: "18px",
    padding: "25px",
    color: "white",
    boxShadow: "0 20px 50px rgba(0,0,0,0.4)"
  });

  const title = document.createElement("h2");

  title.textContent = "프로필 수정";
  title.style.textAlign = "center";
  title.style.marginTop = "0";

  box.appendChild(title);


  // ========================================
  // 사진 미리보기
  // ========================================

  const preview = document.createElement("img");

  preview.src = person.profile_image
    ? person.profile_image
    : "https://ui-avatars.com/api/?name=" +
      encodeURIComponent(person.name) +
      "&background=334155&color=ffffff&size=160";

  Object.assign(preview.style, {
    display: "block",
    width: "100px",
    height: "100px",
    objectFit: "cover",
    borderRadius: "50%",
    margin: "10px auto 15px"
  });

  box.appendChild(preview);


  // ========================================
  // 사진 선택
  // ========================================

  const imageInput = document.createElement("input");

  imageInput.type = "file";
  imageInput.accept = "image/*";

  imageInput.style.display = "block";
  imageInput.style.margin = "0 auto 20px";

  box.appendChild(imageInput);

  imageInput.onchange = function() {
    const file = imageInput.files[0];

    if (file) {
      preview.src = URL.createObjectURL(file);
    }
  };


  // ========================================
  // 이름
  // ========================================

  const nameLabel = document.createElement("div");

  nameLabel.textContent = "이름";
  nameLabel.style.marginBottom = "5px";

  box.appendChild(nameLabel);

  const nameInput = document.createElement("input");

  nameInput.type = "text";
  nameInput.value = person.name;

  Object.assign(nameInput.style, {
    width: "100%",
    height: "42px",
    padding: "0 12px",
    marginBottom: "15px",
    borderRadius: "8px",
    border: "1px solid #475569",
    boxSizing: "border-box"
  });

  box.appendChild(nameInput);


  // ========================================
  // 별명
  // ========================================

  const nicknameLabel = document.createElement("div");

  nicknameLabel.textContent = "별명";
  nicknameLabel.style.marginBottom = "5px";

  box.appendChild(nicknameLabel);

  const nicknameInput = document.createElement("input");

  nicknameInput.type = "text";
  nicknameInput.value = person.nickname || "";
  nicknameInput.placeholder = "별명을 입력하세요";

  Object.assign(nicknameInput.style, {
    width: "100%",
    height: "42px",
    padding: "0 12px",
    marginBottom: "15px",
    borderRadius: "8px",
    border: "1px solid #475569",
    boxSizing: "border-box"
  });

  box.appendChild(nicknameInput);


  // ========================================
  // 한줄 소개
  // ========================================

  const descriptionLabel = document.createElement("div");

  descriptionLabel.textContent = "한줄 소개";
  descriptionLabel.style.marginBottom = "5px";

  box.appendChild(descriptionLabel);

  const descriptionInput = document.createElement("input");

  descriptionInput.type = "text";
  descriptionInput.value = person.description || "";
  descriptionInput.placeholder = "한줄 소개를 입력하세요";

  Object.assign(descriptionInput.style, {
    width: "100%",
    height: "42px",
    padding: "0 12px",
    marginBottom: "15px",
    borderRadius: "8px",
    border: "1px solid #475569",
    boxSizing: "border-box"
  });

  box.appendChild(descriptionInput);


  // ========================================
  // 티어
  // ========================================

  const tierLabel = document.createElement("div");

  tierLabel.textContent = "티어";
  tierLabel.style.marginBottom = "5px";

  box.appendChild(tierLabel);

  const tierSelect = document.createElement("select");

  ["팀장", "팀원", "뉴비"].forEach(function(tier) {
    const option = document.createElement("option");

    option.value = tier;
    option.textContent = tier;

    if (tier === person.tier) {
      option.selected = true;
    }

    tierSelect.appendChild(option);
  });

  Object.assign(tierSelect.style, {
    width: "100%",
    height: "42px",
    marginBottom: "20px",
    borderRadius: "8px"
  });

  box.appendChild(tierSelect);


  // ========================================
  // 버튼 영역
  // ========================================

  const buttons = document.createElement("div");

  Object.assign(buttons.style, {
    display: "flex",
    gap: "7px",
    flexWrap: "wrap",
    justifyContent: "center"
  });


  // ========================================
  // 저장 버튼
  // ========================================

  const saveButton = document.createElement("button");

  saveButton.textContent = "저장";

  Object.assign(saveButton.style, {
    background: "#2563eb",
    color: "white",
    border: "0",
    borderRadius: "8px",
    padding: "10px 18px",
    cursor: "pointer"
  });

  saveButton.onclick = function() {
    saveProfile(
      person,
      nameInput.value.trim(),
      nicknameInput.value.trim(),
      descriptionInput.value.trim(),
      tierSelect.value,
      imageInput.files[0],
      modal
    );
  };

  buttons.appendChild(saveButton);


  // ========================================
  // 사람 삭제 버튼
  // ========================================

  const deletePersonButton =
    document.createElement("button");

  deletePersonButton.textContent = "사람 삭제";

  Object.assign(deletePersonButton.style, {
    background: "#991b1b",
    color: "white",
    border: "0",
    borderRadius: "8px",
    padding: "10px 18px",
    cursor: "pointer"
  });

  deletePersonButton.onclick = function() {
    deletePerson(person.id, modal);
  };

  buttons.appendChild(deletePersonButton);


  // ========================================
  // 닫기 버튼
  // ========================================

  const closeButton =
    document.createElement("button");

  closeButton.textContent = "닫기";

  Object.assign(closeButton.style, {
    background: "#475569",
    color: "white",
    border: "0",
    borderRadius: "8px",
    padding: "10px 18px",
    cursor: "pointer"
  });

  closeButton.onclick = function() {
    modal.remove();
  };

  buttons.appendChild(closeButton);

  box.appendChild(buttons);

  modal.appendChild(box);

  document.body.appendChild(modal);
}


// ========================================
// 프로필 저장
// ========================================

async function saveProfile(
  person,
  name,
  nickname,
  description,
  tier,
  imageFile,
  modal
) {
  if (!name) {
    alert("이름을 입력해주세요.");
    return;
  }

  let profileImage =
    person.profile_image || "";


  // ========================================
  // 새 사진 업로드
  // ========================================

  if (imageFile) {
    const fileExt =
      imageFile.name.split(".").pop();

    const fileName =
      person.id +
      "_" +
      Date.now() +
      "." +
      fileExt;

    const filePath =
      "profiles/" + fileName;

    const { error: uploadError } =
      await supabaseClient
        .storage
        .from("progile-images")
        .upload(
          filePath,
          imageFile,
          {
            upsert: true
          }
        );

    if (uploadError) {
      console.error(uploadError);

      alert(
        "사진 업로드에 실패했습니다.\n" +
        "Supabase Storage의 profiles 버킷을 확인해주세요."
      );

      return;
    }

    const { data: publicData } =
      supabaseClient
        .storage
        .from("progile-images")
        .getPublicUrl(filePath);

    profileImage =
      publicData.publicUrl;
  }


  // ========================================
  // DB 수정
  // ========================================

  const { error } =
    await supabaseClient
      .from("people")
      .update({
        name: name,
        nickname: nickname,
        description: description,
        tier: tier,
        profile_image: profileImage
      })
      .eq("id", person.id);

  if (error) {
    console.error(error);

    alert("프로필 수정에 실패했습니다.");

    return;
  }

  alert("프로필이 수정되었습니다.");

  modal.remove();

  loadPeople();
  loadProfiles();
  loadParticipants();
}


// ========================================
// 사람 삭제
// ========================================

async function deletePerson(id, modal) {
  const confirmed =
    confirm(
      "정말 이 사람을 삭제하시겠습니까?"
    );

  if (!confirmed) {
    return;
  }

  const { error } =
    await supabaseClient
      .from("people")
      .delete()
      .eq("id", id);

  if (error) {
    console.error(error);

    alert("삭제에 실패했습니다.");

    return;
  }

  alert("삭제되었습니다.");

  modal.remove();

  loadPeople();
  loadProfiles();
  loadParticipants();
}


// ========================================
// 프로필 목록
// ========================================

// ========================================
// 프로필 목록
// ========================================

async function loadProfiles() {
  const profileList =
    document.getElementById("profileList");

  if (!profileList) return;

  profileList.innerHTML = "";

  const { data, error } =
    await supabaseClient
      .from("people")
      .select("*")
      .order("id", {
        ascending: true
      });

  if (error) {
    console.error(error);

    profileList.innerHTML =
      "<p>프로필을 불러오지 못했습니다.</p>";

    return;
  }

  if (!data || data.length === 0) {
    profileList.innerHTML =
      "<p class='profile-empty'>" +
      "등록된 프로필이 없습니다." +
      "</p>";

    return;
  }

  data.forEach(function(person) {
    const card =
      document.createElement("div");

    card.className = "profile-card";

    // ========================================
    // 카드 클릭 → 개인 전적
    // ========================================

    card.style.cursor = "pointer";

    card.addEventListener(
      "click",
      function() {
        openPlayerRecord(person);
      }
    );


    // ========================================
    // 사진
    // ========================================

    const image =
      document.createElement("img");

    image.src =
      person.profile_image
        ? person.profile_image
        : "https://ui-avatars.com/api/?name=" +
          encodeURIComponent(person.name) +
          "&background=334155&color=ffffff&size=200";

    image.alt = person.name;
    image.className = "profile-image";

    card.appendChild(image);


    // ========================================
    // 이름
    // ========================================

    const name =
      document.createElement("h2");

    name.textContent = person.name;
    name.className = "profile-name";

    card.appendChild(name);


    // ========================================
    // 닉네임
    // ========================================

    if (person.nickname) {
      const nickname =
        document.createElement("div");

      nickname.textContent =
        "@" + person.nickname;

      nickname.className =
        "profile-nickname";

      card.appendChild(nickname);
    }


    // ========================================
    // 자기소개
    // ========================================

    if (person.description) {
      const description =
        document.createElement("p");

      description.textContent =
        person.description;

      description.className =
        "profile-description";

      card.appendChild(description);
    }


    // ========================================
    // 티어
    // ========================================

    const tier =
      document.createElement("div");

    tier.textContent = person.tier;

    tier.className =
      "profile-tier tier-" +
      person.tier;

    card.appendChild(tier);


    // ========================================
    // 전적 보기 안내
    // ========================================

    const recordHint =
      document.createElement("div");

    recordHint.textContent =
      "클릭하여 개인 전적 보기";

    Object.assign(recordHint.style, {
      marginTop: "10px",
      fontSize: "12px",
      color: "#94a3b8"
    });

    card.appendChild(recordHint);


    // ========================================
    // 수정 버튼
    // ========================================

    const editButton =
      document.createElement("button");

    editButton.textContent =
      "프로필 수정";

    editButton.className =
      "profile-edit-button";

    editButton.onclick = function(event) {

      // 카드 클릭 이벤트 방지
      event.stopPropagation();

      openEditModal(person);
    };

    card.appendChild(editButton);

    profileList.appendChild(card);
  });
}


// ========================================
// 개인 전적
// ========================================

async function openPlayerRecord(person) {

  // ========================================
  // 기존 모달 제거
  // ========================================

  const oldModal =
    document.getElementById(
      "playerRecordModal"
    );

  if (oldModal) {
    oldModal.remove();
  }


  // ========================================
  // 로딩 모달
  // ========================================

  const modal =
    document.createElement("div");

  modal.id =
    "playerRecordModal";

  Object.assign(modal.style, {
    position: "fixed",
    left: "0",
    top: "0",
    width: "100%",
    height: "100%",
    background: "rgba(0,0,0,0.75)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: "9999",
    padding: "20px",
    boxSizing: "border-box"
  });


  const box =
    document.createElement("div");

  Object.assign(box.style, {
    width: "min(650px, 100%)",
    maxHeight: "90vh",
    overflowY: "auto",
    background: "#1e293b",
    borderRadius: "18px",
    padding: "30px",
    color: "white",
    boxSizing: "border-box"
  });


  const loading =
    document.createElement("p");

  loading.textContent =
    "개인 전적을 불러오는 중...";

  loading.style.textAlign =
    "center";

  box.appendChild(loading);

  modal.appendChild(box);

  document.body.appendChild(modal);


  // ========================================
  // 개인이 참가한 팀 기록 가져오기
  // ========================================

  const {
    data: playerRows,
    error: playerError
  } =
    await supabaseClient
      .from("match_players")
      .select("team_id")
      .eq(
        "person_id",
        person.id
      );


  if (playerError) {
    console.error(playerError);

    loading.textContent =
      "개인 전적을 불러오지 못했습니다.";

    return;
  }


  const teamIds =
    (playerRows || []).map(
      function(row) {
        return row.team_id;
      }
    );


  // ========================================
  // 참가 기록이 없는 경우
  // ========================================

  if (teamIds.length === 0) {
    renderPlayerRecord(
      box,
      person,
      []
    );

    return;
  }


  // ========================================
  // 팀 기록 가져오기
  // ========================================

  const {
    data: teams,
    error: teamError
  } =
    await supabaseClient
      .from("match_teams")
      .select(
        "id, match_id, team_number, rank"
      )
      .in(
        "id",
        teamIds
      );


  if (teamError) {
    console.error(teamError);

    loading.textContent =
      "팀 전적을 불러오지 못했습니다.";

    return;
  }


  if (!teams || teams.length === 0) {
    renderPlayerRecord(
      box,
      person,
      []
    );

    return;
  }


  // ========================================
  // 내전 번호 가져오기
  // ========================================

  const matchIds =
    teams.map(
      function(team) {
        return team.match_id;
      }
    );


  const {
    data: matches,
    error: matchError
  } =
    await supabaseClient
      .from("matches")
      .select(
        "id, match_number"
      )
      .in(
        "id",
        matchIds
      );


  if (matchError) {
    console.error(matchError);

    loading.textContent =
      "내전 정보를 불러오지 못했습니다.";

    return;
  }


  // ========================================
  // 개인 전적 데이터 조합
  // ========================================

  const records =
    teams.map(function(team) {

      const match =
        (matches || []).find(
          function(item) {
            return item.id ===
              team.match_id;
          }
        );

      return {
        matchId:
          team.match_id,

        matchNumber:
          match
            ? match.match_number
            : "-",

        teamNumber:
          team.team_number,

        rank:
          team.rank
      };
    });


  // 최신 내전부터
  records.sort(
    function(a, b) {
      return Number(b.matchNumber) -
        Number(a.matchNumber);
    }
  );


  renderPlayerRecord(
    box,
    person,
    records
  );
}


// ========================================
// 개인 전적 화면 출력
// ========================================

function renderPlayerRecord(
  box,
  person,
  records
) {

  box.innerHTML = "";


  // ========================================
  // 프로필
  // ========================================

  const image =
    document.createElement("img");

  image.src =
    person.profile_image
      ? person.profile_image
      : "https://ui-avatars.com/api/?name=" +
        encodeURIComponent(person.name) +
        "&background=334155&color=ffffff&size=200";

  Object.assign(image.style, {
    display: "block",
    width: "100px",
    height: "100px",
    borderRadius: "50%",
    objectFit: "cover",
    margin: "0 auto 15px"
  });

  box.appendChild(image);


  const name =
    document.createElement("h2");

  name.textContent =
    person.name;

  name.style.textAlign =
    "center";

  name.style.margin =
    "0 0 5px";

  box.appendChild(name);


  if (person.nickname) {

    const nickname =
      document.createElement("div");

    nickname.textContent =
      "@" + person.nickname;

    nickname.style.textAlign =
      "center";

    nickname.style.color =
      "#94a3b8";

    nickname.style.marginBottom =
      "10px";

    box.appendChild(nickname);
  }


  const tier =
    document.createElement("div");

  tier.textContent =
    person.tier;

  Object.assign(tier.style, {
    textAlign: "center",
    fontWeight: "900",
    marginBottom: "25px"
  });

  box.appendChild(tier);


  // ========================================
  // 통계 계산
  // ========================================

  const total =
    records.length;

  const first =
    records.filter(
      function(record) {
        return record.rank === 1;
      }
    ).length;

  const second =
    records.filter(
      function(record) {
        return record.rank === 2;
      }
    ).length;

  const third =
    records.filter(
      function(record) {
        return record.rank === 3;
      }
    ).length;


  // ========================================
  // 통계 카드
  // ========================================

  const stats =
    document.createElement("div");

  Object.assign(stats.style, {
    display: "grid",
    gridTemplateColumns:
      "repeat(4, 1fr)",
    gap: "10px",
    marginBottom: "25px"
  });


  const statData = [
    ["총 경기", total],
    ["🥇 1위", first],
    ["🥈 2위", second],
    ["🥉 3위", third]
  ];


  statData.forEach(
    function(item) {

      const stat =
        document.createElement("div");

      Object.assign(stat.style, {
        background: "#273449",
        borderRadius: "12px",
        padding: "15px 8px",
        textAlign: "center"
      });


      const label =
        document.createElement("div");

      label.textContent =
        item[0];

      label.style.fontSize =
        "13px";

      label.style.color =
        "#94a3b8";

      label.style.marginBottom =
        "7px";


      const value =
        document.createElement("div");

      value.textContent =
        item[1];

      value.style.fontSize =
        "22px";

      value.style.fontWeight =
        "900";


      stat.appendChild(label);
      stat.appendChild(value);

      stats.appendChild(stat);
    }
  );


  box.appendChild(stats);


  // ========================================
  // 순위 비율
  // ========================================

  if (total > 0) {

    const percentage =
      document.createElement("div");

    percentage.textContent =
      "1위 " +
      Math.round(first / total * 100) +
      "%  ·  " +
      "2위 " +
      Math.round(second / total * 100) +
      "%  ·  " +
      "3위 " +
      Math.round(third / total * 100) +
      "%";

    Object.assign(percentage.style, {
      textAlign: "center",
      color: "#cbd5e1",
      marginBottom: "25px"
    });

    box.appendChild(percentage);
  }


  // ========================================
  // 경기 기록 제목
  // ========================================

  const historyTitle =
    document.createElement("h3");

  historyTitle.textContent =
    "최근 내전 기록";

  historyTitle.style.margin =
    "0 0 12px";

  box.appendChild(historyTitle);


  // ========================================
  // 경기 기록
  // ========================================

  if (records.length === 0) {

    const empty =
      document.createElement("p");

    empty.textContent =
      "아직 참여한 내전이 없습니다.";

    empty.style.textAlign =
      "center";

    empty.style.color =
      "#94a3b8";

    box.appendChild(empty);

  } else {

    records.forEach(
      function(record) {

        const row =
          document.createElement("div");

        Object.assign(row.style, {
          background: "#273449",
          borderRadius: "10px",
          padding: "12px 15px",
          marginBottom: "8px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        });


        const matchInfo =
          document.createElement("div");

        matchInfo.textContent =
          "#" +
          record.matchNumber +
          " 내전  ·  팀 " +
          record.teamNumber;

        matchInfo.style.fontWeight =
          "700";


        const rank =
          document.createElement("strong");

        if (record.rank === 1) {
          rank.textContent = "🥇 1위";
        } else if (record.rank === 2) {
          rank.textContent = "🥈 2위";
        } else if (record.rank === 3) {
          rank.textContent = "🥉 3위";
        } else {
          rank.textContent =
            record.rank + "위";
        }


        row.appendChild(matchInfo);
        row.appendChild(rank);

        box.appendChild(row);
      }
    );
  }


  // ========================================
  // 닫기 버튼
  // ========================================

  const closeButton =
    document.createElement("button");

  closeButton.textContent =
    "닫기";

  Object.assign(closeButton.style, {
    display: "block",
    width: "100%",
    marginTop: "20px",
    padding: "11px",
    border: "none",
    borderRadius: "8px",
    background: "#475569",
    color: "white",
    fontWeight: "700",
    cursor: "pointer"
  });


  closeButton.onclick =
    function() {

      const modal =
        document.getElementById(
          "playerRecordModal"
        );

      if (modal) {
        modal.remove();
      }
    };


  box.appendChild(closeButton);
}

// ========================================
// 참가자 목록
// ========================================

async function loadParticipants() {
  const participantList =
    document.getElementById("participantList");

  const participantCount =
    document.getElementById("participantCount");

  if (!participantList) return;

  participantList.innerHTML =
    "<p class='team-loading'>" +
    "사람 목록을 불러오는 중..." +
    "</p>";

  const { data, error } =
    await supabaseClient
      .from("people")
      .select("*")
      .order("id", {
        ascending: true
      });

  if (error) {
    console.error(error);

    participantList.innerHTML =
      "<p class='team-error'>" +
      "사람 목록을 불러오지 못했습니다." +
      "</p>";

    return;
  }

  participantList.innerHTML = "";

  if (!data || data.length === 0) {
    participantList.innerHTML =
      "<p class='team-error'>" +
      "등록된 사람이 없습니다." +
      "</p>";

    if (participantCount) {
      participantCount.textContent =
        "0명";
    }

    return;
  }

  data.forEach(function(person) {
    const item =
      document.createElement("label");

    item.className =
      "participant-item";

    const checkbox =
      document.createElement("input");

    checkbox.type = "checkbox";
    checkbox.className =
      "participant-checkbox";

    checkbox.value =
      person.id;

    checkbox.addEventListener(
      "change",
      updateParticipantCount
    );

    const name =
      document.createElement("span");

    name.textContent =
      person.name;

    item.appendChild(checkbox);
    item.appendChild(name);

    participantList.appendChild(item);
  });

  updateParticipantCount();
}


// ========================================
// 참가자 수 표시
// ========================================

function updateParticipantCount() {
  const participantCount =
    document.getElementById(
      "participantCount"
    );

  if (!participantCount) return;

  const checked =
    document.querySelectorAll(
      ".participant-checkbox:checked"
    );

  participantCount.textContent =
    checked.length + "명";
}


// ========================================
// 랜덤 팀 생성
// ========================================

async function createRandomTeam() {
  const teamResult =
    document.getElementById("teamResult");

  if (!teamResult) return;

  const checked =
    document.querySelectorAll(
      ".participant-checkbox:checked"
    );


  // 참가자 없음
  if (checked.length === 0) {
    teamResult.innerHTML =
      "<p class='team-error'>" +
      "참가자를 먼저 선택해주세요." +
      "</p>";

    return;
  }


  // 3명 미만
  if (checked.length < 3) {
    teamResult.innerHTML =
      "<p class='team-error'>" +
      "최소 3명을 선택해주세요." +
      "</p>";

    return;
  }


  // 3명 단위 확인
  if (checked.length % 3 !== 0) {
    teamResult.innerHTML =
      "<p class='team-error'>" +
      "참가자는 3명 단위로 선택해주세요." +
      "</p>";

    return;
  }

  teamResult.innerHTML =
    "<p class='team-loading'>" +
    "팀을 만드는 중..." +
    "</p>";


  // 선택된 사람 ID
  const selectedIds =
    Array.from(checked).map(
      function(checkbox) {
        return Number(
          checkbox.value
        );
      }
    );


  // 사람 정보 가져오기
  const { data, error } =
    await supabaseClient
      .from("people")
      .select("*")
      .in("id", selectedIds);

  if (error) {
    console.error(error);

    teamResult.innerHTML =
      "<p class='team-error'>" +
      "참가자 정보를 불러오지 못했습니다." +
      "</p>";

    return;
  }

  if (!data || data.length < 3) {
    teamResult.innerHTML =
      "<p class='team-error'>" +
      "참가자를 불러오지 못했습니다." +
      "</p>";

    return;
  }


  // ========================================
  // 완전 랜덤 섞기
  // ========================================

  const shuffled =
    [...data];

  for (
    let i = shuffled.length - 1;
    i > 0;
    i--
  ) {
    const j =
      Math.floor(
        Math.random() * (i + 1)
      );

    [
      shuffled[i],
      shuffled[j]
    ] =
    [
      shuffled[j],
      shuffled[i]
    ];
  }


  // ========================================
  // 3명씩 팀 만들기
  // ========================================

  const teams = [];

  for (
    let i = 0;
    i < shuffled.length;
    i += 3
  ) {
    teams.push(
      shuffled.slice(i, i + 3)
    );
  }

  currentTeams = teams;


  // ========================================
  // 결과 출력
  // ========================================

  teamResult.innerHTML = "";

  const title =
    document.createElement("h2");

  title.textContent =
    "랜덤 팀";

  title.className =
    "team-result-title";

  teamResult.appendChild(title);


  // ========================================
  // 팀 표시
  // ========================================

  teams.forEach(function(
    team,
    teamIndex
  ) {
    const teamBox =
      document.createElement("div");

    teamBox.className =
      "team-box";


    const teamTitle =
      document.createElement("h3");

    teamTitle.textContent =
      "팀 " +
      (teamIndex + 1);

    teamTitle.style.margin =
      "30px 0 15px";

    teamTitle.style.fontSize =
      "22px";

    teamTitle.style.color =
      "white";

    teamBox.appendChild(teamTitle);


    const teamCards =
      document.createElement("div");

    teamCards.className =
      "team-cards";


    team.forEach(function(person) {
      const card =
        document.createElement("div");

      card.className =
        "team-card";


      const image =
        document.createElement("img");

      image.src =
        person.profile_image
          ? person.profile_image
          : "https://ui-avatars.com/api/?name=" +
            encodeURIComponent(person.name) +
            "&background=334155&color=ffffff&size=200";

      image.alt =
        person.name;

      image.className =
        "team-image";

      card.appendChild(image);


      const name =
        document.createElement("h3");

      name.textContent =
        person.name;

      name.className =
        "team-name";

      card.appendChild(name);


      if (person.nickname) {
        const nickname =
          document.createElement("div");

        nickname.textContent =
          "@" + person.nickname;

        nickname.className =
          "team-nickname";

        card.appendChild(nickname);
      }

      teamCards.appendChild(card);
    });


    teamBox.appendChild(teamCards);


    // ========================================
    // 순위 선택
    // ========================================

    const rankBox =
      document.createElement("div");

    rankBox.className =
      "team-rank-box";


    const rankLabel =
      document.createElement("span");

    rankLabel.textContent =
      "순위";

    rankLabel.className =
      "team-rank-label";


    const rankSelect =
      document.createElement("select");

    rankSelect.className =
      "team-rank-select";

    rankSelect.dataset.teamIndex =
      teamIndex;

    rankSelect.dataset.previousValue =
      String(teamIndex + 1);


    // 순위 옵션
    for (
      let rank = 1;
      rank <= teams.length;
      rank++
    ) {
      const option =
        document.createElement("option");

      option.value =
        rank;

      option.textContent =
        rank + "위";

      if (
        rank ===
        teamIndex + 1
      ) {
        option.selected =
          true;
      }

      rankSelect.appendChild(option);
    }


    // 중복 순위 방지
    rankSelect.addEventListener(
      "change",
      function() {
        const selects =
          document.querySelectorAll(
            ".team-rank-select"
          );

        const selectedRanks =
          Array.from(selects).map(
            function(select) {
              return select.value;
            }
          );

        const currentValue =
          rankSelect.value;

        const duplicate =
          selectedRanks.filter(
            function(rank) {
              return rank ===
                currentValue;
            }
          ).length > 1;

        if (duplicate) {
          alert(
            "같은 순위는 선택할 수 없습니다."
          );

          rankSelect.value =
            rankSelect.dataset.previousValue ||
            String(teamIndex + 1);

          return;
        }

        rankSelect.dataset.previousValue =
          rankSelect.value;
      }
    );


    rankBox.appendChild(rankLabel);
    rankBox.appendChild(rankSelect);

    teamBox.appendChild(rankBox);

    teamResult.appendChild(teamBox);
  });


  // ========================================
  // 내전 기록 저장 버튼
  // ========================================

  const saveButton =
    document.createElement("button");

  saveButton.textContent =
    "내전 기록 저장";

  saveButton.className =
    "save-match-button";

  saveButton.onclick =
    function() {
      saveMatchResult();
    };

  teamResult.appendChild(saveButton);
}


// ========================================
// 내전 기록 저장
// ========================================

async function saveMatchResult() {
  if (
    !currentTeams ||
    currentTeams.length === 0
  ) {
    alert(
      "먼저 랜덤 팀을 생성해주세요."
    );

    return;
  }


  const rankSelects =
    document.querySelectorAll(
      ".team-rank-select"
    );

  if (
    rankSelects.length !==
    currentTeams.length
  ) {
    alert(
      "팀 순위 정보를 찾을 수 없습니다."
    );

    return;
  }


  const ranks =
    Array.from(rankSelects).map(
      function(select) {
        return Number(select.value);
      }
    );


  // 중복 확인
  const uniqueRanks =
    new Set(ranks);

  if (
    uniqueRanks.size !==
    ranks.length
  ) {
    alert(
      "같은 순위를 가진 팀이 있습니다."
    );

    return;
  }


  // 순위 확인
  for (
    let i = 0;
    i < ranks.length;
    i++
  ) {
    if (
      !ranks[i] ||
      ranks[i] < 1 ||
      ranks[i] > currentTeams.length
    ) {
      alert(
        "팀 순위를 확인해주세요."
      );

      return;
    }
  }


  const teamResult =
    document.getElementById(
      "teamResult"
    );

  if (teamResult) {
    teamResult.innerHTML +=
      "<p class='team-loading'>" +
      "내전 기록을 저장하는 중..." +
      "</p>";
  }


  // ========================================
  // 다음 내전 번호
  // ========================================

  const {
    data: existingMatches,
    error: matchSelectError
  } =
    await supabaseClient
      .from("matches")
      .select("match_number")
      .order(
        "match_number",
        {
          ascending: false
        }
      )
      .limit(1);

  if (matchSelectError) {
    console.error(
      matchSelectError
    );

    alert(
      "기존 내전 기록을 확인하지 못했습니다."
    );

    return;
  }


  let nextMatchNumber = 1;

  if (
    existingMatches &&
    existingMatches.length > 0
  ) {
    nextMatchNumber =
      Number(
        existingMatches[0]
          .match_number
      ) + 1;
  }


  // ========================================
  // matches 저장
  // ========================================

  const {
    data: matchData,
    error: matchError
  } =
    await supabaseClient
      .from("matches")
      .insert([
        {
          match_number:
            nextMatchNumber
        }
      ])
      .select()
      .single();

  if (matchError) {
    console.error(matchError);

    alert(
      "내전 기록 저장에 실패했습니다."
    );

    return;
  }


  const matchId =
    matchData.id;


  // ========================================
  // 팀 저장
  // ========================================

  for (
    let i = 0;
    i < currentTeams.length;
    i++
  ) {
    const team =
      currentTeams[i];


    const {
      data: teamData,
      error: teamError
    } =
      await supabaseClient
        .from("match_teams")
        .insert([
          {
            match_id:
              matchId,

            team_number:
              i + 1,

            rank:
              ranks[i]
          }
        ])
        .select()
        .single();


    if (teamError) {
      console.error(
        teamError
      );


      await supabaseClient
        .from("matches")
        .delete()
        .eq(
          "id",
          matchId
        );


      alert(
        "팀 기록 저장에 실패했습니다."
      );

      return;
    }


    const teamId =
      teamData.id;


    // ========================================
    // 팀원 저장
    // ========================================

    const playerRows =
      team.map(function(person) {
        return {
          team_id:
            teamId,

          person_id:
            person.id
        };
      });


    const {
      error: playerError
    } =
      await supabaseClient
        .from("match_players")
        .insert(
          playerRows
        );


    if (playerError) {
      console.error(
        playerError
      );


      await supabaseClient
        .from("matches")
        .delete()
        .eq(
          "id",
          matchId
        );


      alert(
        "팀원 기록 저장에 실패했습니다."
      );

      return;
    }
  }


  // ========================================
  // 저장 완료
  // ========================================

  alert(
    nextMatchNumber +
    "번째 내전 기록이 저장되었습니다."
  );


  if (teamResult) {
    teamResult.innerHTML =
      "<p class='team-success'>" +
      nextMatchNumber +
      "번째 내전 기록이 저장되었습니다." +
      "</p>";
  }


  currentTeams = [];
}


// ========================================
// 내전 기록 불러오기
// ========================================

async function loadMatchHistory() {
  const historyList =
    document.getElementById(
      "historyList"
    );

  if (!historyList) return;

  historyList.innerHTML =
    "<p class='history-loading'>" +
    "내전 기록을 불러오는 중..." +
    "</p>";


  const {
    data: matches,
    error: matchError
  } =
    await supabaseClient
      .from("matches")
      .select("*")
      .order(
        "match_number",
        {
          ascending: false
        }
      );


  if (matchError) {
    console.error(
      matchError
    );

    historyList.innerHTML =
      "<p class='history-error'>" +
      "내전 기록을 불러오지 못했습니다." +
      "</p>";

    return;
  }


  if (
    !matches ||
    matches.length === 0
  ) {
    historyList.innerHTML =
      "<p class='history-empty'>" +
      "아직 진행한 내전이 없습니다." +
      "</p>";

    return;
  }


  historyList.innerHTML = "";


  for (const match of matches) {
    const matchBox =
      document.createElement("div");

    matchBox.className =
      "history-match";


    const matchTitle =
      document.createElement("h2");

    matchTitle.textContent =
      "#" +
      match.match_number +
      " 내전";

    matchTitle.className =
      "history-match-title";

    matchBox.appendChild(
      matchTitle
    );


    const {
      data: teams,
      error: teamError
    } =
      await supabaseClient
        .from("match_teams")
        .select("*")
        .eq(
          "match_id",
          match.id
        )
        .order(
          "team_number",
          {
            ascending: true
          }
        );


    if (teamError) {
      console.error(
        teamError
      );

      continue;
    }


    if (
      !teams ||
      teams.length === 0
    ) {
      const empty =
        document.createElement("p");

      empty.textContent =
        "팀 기록이 없습니다.";

      empty.className =
        "history-empty";

      matchBox.appendChild(
        empty
      );

      historyList.appendChild(
        matchBox
      );

      continue;
    }


    for (const team of teams) {
      const teamBox =
        document.createElement("div");

      teamBox.className =
        "history-team";


      const teamHeader =
        document.createElement("div");

      teamHeader.className =
        "history-team-header";


      const teamName =
        document.createElement("h3");

      teamName.textContent =
        "팀 " +
        team.team_number;

      teamHeader.appendChild(
        teamName
      );


      // ========================================
      // 순위
      // 클릭하면 상세 기록
      // ========================================

      const rank =
        document.createElement("span");

      rank.textContent =
        team.rank + "위";

      rank.className =
        "history-rank";

      rank.style.cursor =
        "pointer";

      rank.title =
        "내전 상세 기록 보기";


      rank.addEventListener(
        "click",
        function() {
          openMatchDetail(
            match.id
          );
        }
      );


      teamHeader.appendChild(
        rank
      );

      teamBox.appendChild(
        teamHeader
      );


      // ========================================
      // 팀원
      // ========================================

      const {
        data: players,
        error: playerError
      } =
        await supabaseClient
          .from("match_players")
          .select("person_id")
          .eq(
            "team_id",
            team.id
          );


      if (playerError) {
        console.error(
          playerError
        );

        continue;
      }


      const playerList =
        document.createElement("div");

      playerList.className =
        "history-players";


      if (
        players &&
        players.length > 0
      ) {
        const playerIds =
          players.map(
            function(player) {
              return player.person_id;
            }
          );


        const {
          data: people,
          error: peopleError
        } =
          await supabaseClient
            .from("people")
            .select("*")
            .in(
              "id",
              playerIds
            );


        if (peopleError) {
          console.error(
            peopleError
          );
        } else if (people) {
          people.forEach(
            function(person) {
              const player =
                document.createElement(
                  "span"
                );

              player.textContent =
                person.name;

              player.className =
                "history-player";

              playerList.appendChild(
                player
              );
            }
          );
        }
      }


      teamBox.appendChild(
        playerList
      );

      matchBox.appendChild(
        teamBox
      );
    }


    historyList.appendChild(
      matchBox
    );
  }
}


// ========================================
// 내전 상세 기록
// ========================================

async function openMatchDetail(matchId) {
  // ========================================
  // 내전 정보
  // ========================================

  const {
    data: match,
    error: matchError
  } =
    await supabaseClient
      .from("matches")
      .select("*")
      .eq(
        "id",
        matchId
      )
      .single();


  if (matchError) {
    console.error(
      matchError
    );

    alert(
      "내전 기록을 불러오지 못했습니다."
    );

    return;
  }


  // ========================================
  // 팀 정보
  // ========================================

  const {
    data: teams,
    error: teamError
  } =
    await supabaseClient
      .from("match_teams")
      .select("*")
      .eq(
        "match_id",
        matchId
      )
      .order(
        "rank",
        {
          ascending: true
        }
      );


  if (teamError) {
    console.error(
      teamError
    );

    alert(
      "팀 기록을 불러오지 못했습니다."
    );

    return;
  }


  // ========================================
  // 기존 모달 제거
  // ========================================

  const oldModal =
    document.getElementById(
      "matchDetailModal"
    );

  if (oldModal) {
    oldModal.remove();
  }


  // ========================================
  // 모달
  // ========================================

  const modal =
    document.createElement("div");

  modal.id =
    "matchDetailModal";

  Object.assign(modal.style, {
    position: "fixed",
    left: "0",
    top: "0",
    width: "100%",
    height: "100%",
    background: "rgba(0,0,0,0.75)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: "9999",
    padding: "20px",
    boxSizing: "border-box"
  });


  // ========================================
  // 내용 박스
  // ========================================

  const box =
    document.createElement("div");

  Object.assign(box.style, {
    width: "min(700px, 100%)",
    maxHeight: "90vh",
    overflowY: "auto",
    background: "#1e293b",
    borderRadius: "18px",
    padding: "30px",
    color: "white",
    boxSizing: "border-box"
  });


  // ========================================
  // 제목
  // ========================================

  const title =
    document.createElement("h2");

  title.textContent =
    "#" +
    match.match_number +
    " 내전 상세";

  title.style.textAlign =
    "center";

  title.style.marginTop =
    "0";

  title.style.marginBottom =
    "25px";

  box.appendChild(title);


  // ========================================
  // 팀 출력
  // ========================================

  for (const team of teams) {
    const teamBox =
      document.createElement("div");

    Object.assign(teamBox.style, {
      background: "#273449",
      borderRadius: "12px",
      padding: "18px",
      marginBottom: "12px"
    });


    const teamTitle =
      document.createElement("div");

    teamTitle.textContent =
      "팀 " +
      team.team_number +
      "  ·  " +
      team.rank +
      "위";


    Object.assign(teamTitle.style, {
      fontSize: "18px",
      fontWeight: "900",
      marginBottom: "12px"
    });


    teamBox.appendChild(
      teamTitle
    );


    const {
      data: players,
      error: playerError
    } =
      await supabaseClient
        .from("match_players")
        .select("person_id")
        .eq(
          "team_id",
          team.id
        );


    if (playerError) {
      console.error(
        playerError
      );

      continue;
    }


    if (
      players &&
      players.length > 0
    ) {
      const playerIds =
        players.map(
          function(player) {
            return player.person_id;
          }
        );


      const {
        data: people,
        error: peopleError
      } =
        await supabaseClient
          .from("people")
          .select("*")
          .in(
            "id",
            playerIds
          );


      if (peopleError) {
        console.error(
          peopleError
        );
      } else if (people) {
        people.forEach(
          function(person) {
            const player =
              document.createElement(
                "div"
              );

            player.textContent =
              person.name;


            Object.assign(player.style, {
              padding: "8px 0",
              color: "#cbd5e1",
              fontWeight: "700"
            });


            teamBox.appendChild(
              player
            );
          }
        );
      }
    }


    box.appendChild(
      teamBox
    );
  }


  // ========================================
  // 내전 삭제 버튼
  // ========================================

  const deleteMatchButton =
    document.createElement("button");

  deleteMatchButton.textContent =
    "이 내전 삭제";

  Object.assign(
    deleteMatchButton.style,
    {
      display: "block",
      width: "100%",
      marginTop: "10px",
      padding: "11px 25px",
      border: "none",
      borderRadius: "8px",
      background: "#991b1b",
      color: "white",
      fontWeight: "700",
      cursor: "pointer"
    }
  );


  deleteMatchButton.onclick =
    async function() {
      const confirmed =
        confirm(
          "#" +
          match.match_number +
          " 내전 기록을 정말 삭제하시겠습니까?\n\n" +
          "이 내전의 팀과 팀원 기록도 함께 삭제됩니다."
        );


      if (!confirmed) {
        return;
      }


      deleteMatchButton.disabled =
        true;

      deleteMatchButton.textContent =
        "삭제 중...";


      const {
        error: deleteError
      } =
        await supabaseClient
          .from("matches")
          .delete()
          .eq(
            "id",
            match.id
          );


      if (deleteError) {
        console.error(
          deleteError
        );

        alert(
          "내전 기록 삭제에 실패했습니다."
        );


        deleteMatchButton.disabled =
          false;

        deleteMatchButton.textContent =
          "이 내전 삭제";

        return;
      }


      alert(
        "#" +
        match.match_number +
        " 내전 기록이 삭제되었습니다."
      );


      modal.remove();

      loadMatchHistory();
    };


  box.appendChild(
    deleteMatchButton
  );


  // ========================================
  // 닫기 버튼
  // ========================================

  const closeButton =
    document.createElement("button");

  closeButton.textContent =
    "닫기";


  Object.assign(
    closeButton.style,
    {
      display: "block",
      width: "100%",
      margin: "10px auto 0",
      padding: "10px 25px",
      border: "none",
      borderRadius: "8px",
      background: "#475569",
      color: "white",
      fontWeight: "700",
      cursor: "pointer"
    }
  );


  closeButton.onclick =
    function() {
      modal.remove();
    };


  box.appendChild(
    closeButton
  );


  // ========================================
  // 모달 출력
  // ========================================

  modal.appendChild(
    box
  );

  document.body.appendChild(
    modal
  );
}


// ========================================
// 초기 실행
// ========================================

loadPeople();
loadParticipants();
