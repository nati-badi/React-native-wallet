import { useUser } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import {
  Image,
  Text,
  TouchableOpacity,
  View,
  FlatList,
  Alert,
  RefreshControl,
} from "react-native";
import { SignOutButton } from "@/components/SignOutButton";
import { useTransactions } from "../../hooks/useTransactions.js";
import { useEffect, useState } from "react";
import PageLoader from "../../components/PageLoader.jsx";
import { styles } from "../../assets/styles/home.styles.js";
import { Ionicons } from "@expo/vector-icons";
import BalanceCard from "../../components/BalanceCard.jsx";
import { TransactionItem } from "../../components/TransactionItem.jsx";
import NoTransactionsFound from "../../components/NoTransactionsFound.jsx";

export default function Page() {
  const { user } = useUser();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);

  const { transactions, summary, isLoading, loadData, deleteTransaction } =
    useTransactions(user.id);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData().then(() => setRefreshing(false));
  };

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleDelete = async (id) => {
    Alert.alert(
      "Delete Transaction",
      "Are you sure you want to delete this transaction?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteTransaction(id),
        },
      ]
    );
  };

  if (isLoading && !refreshing) return <PageLoader />;

  console.log(transactions);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* HEADER */}
        <View style={styles.header}>
          {/* LEFT HEADER */}
          <View style={styles.headerLeft}>
            <Image
              source={require("../../assets/images/logo.png")}
              style={styles.headerLogo}
              resizeMode="contain"
            ></Image>

            <View style={styles.welcomeContainer}>
              <Text style={styles.welcomeText}>Welcome</Text>
              <Text style={styles.usernameText}>
                {user?.emailAddresses[0]?.emailAddress.split("@")[0]}
              </Text>
            </View>
          </View>
          {/* RIGHT HEADER */}
          <View style={styles.headerRight}>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => router.push("/create")}
            >
              <Ionicons name="add" size={20} color="#FFF" />
              <Text style={styles.addButtonText}>Add</Text>
            </TouchableOpacity>
            <SignOutButton />
          </View>
        </View>

        <BalanceCard summary={summary} />

        <View style={styles.transactionsHeaderContainer}>
          <Text style={styles.sectionTitle}>Resent Transactions</Text>
        </View>
      </View>

      {/* TRANSACTIONS LIST */}

      <FlatList
        style={styles.transactionsList}
        contentContainerStyle={styles.transactionsListContent}
        data={transactions.transactions}
        renderItem={({ item }) => (
          <TransactionItem item={item} onDelete={handleDelete} />
        )}
        ListEmptyComponent={<NoTransactionsFound />}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
    </View>
  );
}
